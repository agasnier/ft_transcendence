import { useEffect, useRef, useState, Fragment } from 'react'
import { IconFile, IconEdit, IconDelete } from '../../../icons'

interface FileInfo {
    id: number
    originalName: string
    mimeType: string
    size: number
}

interface Message {
    id: number
    channelId: number
    senderId: number
    senderPseudo: string | null
    content: string
    createdAt: string
    type: 'user' | 'system'
    fileId: number | null
    file: FileInfo | null
}

interface MessagesListProps {
    messages: Message[]
    userId: number | null
    role: 'admin' | 'moderator' | 'user' | null
    myChannelRole: 'moderator' | 'member' | null
    channelType: 'channel' | 'group' | 'discussion'
    onEditMessage: (messageId: number, content: string) => Promise<boolean>
    onDeleteMessage: (messageId: number) => Promise<boolean>
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function FileAttachment({ file }: { file: FileInfo }) {
    const fileUrl = `/chat/files/${file.id}`

    if (file.mimeType.startsWith('image/')) {
        return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <img
                    src={fileUrl}
                    alt={file.originalName}
                    className="max-w-64 max-h-64 rounded-xl object-cover border"
                />
            </a>
        )
    }

    return (
        <a href={fileUrl}
            download={file.originalName}
            className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 border hover:bg-white transition-colors max-w-64">
            <IconFile size={24} className="text-gray-500 shrink-0"/>
            <span className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{file.originalName}</span>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
            </span>
        </a>
    )
}

function MessagesList({messages, userId, role, myChannelRole, channelType, onEditMessage, onDeleteMessage}: MessagesListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editDraft, setEditDraft] = useState('')
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    function startEditing(msg: Message) {
        setEditingId(msg.id)
        setEditDraft(msg.content)
    }

    function cancelEditing() {
        setEditingId(null)
    }

    async function saveEdit(messageId: number) {
        if (!editDraft.trim()) return
        const ok = await onEditMessage(messageId, editDraft.trim())
        if (ok) setEditingId(null)
    }

    async function confirmDelete(messageId: number) {
        await onDeleteMessage(messageId)
        setConfirmDeleteId(null)
    }

    function canManage(msg: Message, senderIsAdmin: boolean): { canEdit: boolean; canDelete: boolean } {
        const isOwn = msg.senderId === userId
        if (isOwn) {
            // can't edit files messages
            return { canEdit: msg.fileId === null, canDelete: true }
        }
        if (role === 'admin') return { canEdit: false, canDelete: true }
        if (senderIsAdmin) return { canEdit: false, canDelete: false }
        if (myChannelRole === 'moderator') return { canEdit: false, canDelete: true }
        return { canEdit: false, canDelete: false }
    }

    return (
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                    Aucun message pour l'instant. Commencez la discussion !
                </div>
            ) : (
                messages.map((msg, index) => {
                    const msgDay = new Date(msg.createdAt).toDateString()
                    const prevDay = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null
                    const showDateDivider = msgDay !== prevDay
                    const isOwn = msg.senderId === userId
                    // We let the button and the server refuse if the role is not adapted
                    const { canEdit, canDelete } = canManage(msg, false)

                    const content = msg.type === 'system' ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-xs text-white bg-blue-400 rounded-2xl p-1">
                                {channelType !== 'discussion' && (
                                    <span className="font-bold">
                                        {msg.senderPseudo ?? `Utilisateur #${msg.senderId}`}
                                    </span>
                                )}
                                {msg.content}
                            </span>
                        </div>
                    ) : (
                        <div key={msg.id} className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col min-w-0 p-3 rounded-2xl max-w-md shadow-sm relative
                                ${isOwn
                                ? 'items-end bg-blue-200'
                                : 'items-start bg-white border-blue-100'}
                            `}>
                                <div className="flex justify-between w-full text-sm font-semibold text-blue-700 mb-1 gap-4">
                                    <span>{msg.senderPseudo ?? `Utilisateur #${msg.senderId}`}</span>
                                    <span className="text-blue-500 font-normal">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {editingId === msg.id ? (
                                    <div className="flex flex-col gap-2 w-full">
                                        <textarea
                                            value={editDraft}
                                            onChange={(e) => setEditDraft(e.target.value)}
                                            maxLength={2000}
                                            rows={2}
                                            className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 resize-none"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => saveEdit(msg.id)}
                                                className="text-xs px-2 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                                                Enregistrer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEditing}
                                                className="text-xs px-2 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : msg.file ? (
                                    <FileAttachment file={msg.file} />
                                ) : (
                                    <p className="text-gray-800 whitespace-pre-wrap wrap-break-word min-w-0 w-full">{msg.content}</p>
                                )}

                                {(canEdit || canDelete) && editingId !== msg.id && (
                                    <div className="absolute -top-4 right-2 hidden group-hover:flex gap-1 bg-white rounded-lg shadow border px-1">
                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={() => startEditing(msg)}
                                                title="Modifier"
                                                className="flex items-center justify-center w-6 h-6 rounded">
                                                <IconEdit size={14} className="icon-hover-grow"/>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDeleteId(msg.id)}
                                                title="Supprimer"
                                                className="flex items-center justify-center w-6 h-6 hover:text-red-500 rounded">
                                                <IconDelete size={14} className="hover:text-red-500 icon-hover-grow"/>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {confirmDeleteId === msg.id && (
                                    <div className="absolute top-full right-0 mt-1 z-10 bg-white border rounded-xl shadow-lg p-2 flex flex-col gap-2 w-48">
                                        <span className="text-xs text-gray-600">Supprimer ce message ?</span>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => confirmDelete(msg.id)}
                                                className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600">
                                                Confirmer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDeleteId(null)}
                                                className="text-xs px-2 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                    return (
                        <Fragment key={msg.id}>
                            {showDateDivider && (
                                <div className="flex justify-center">
                                    <span className="text-xs text-gray-400">
                                        {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                            )}
                            {content}
                        </Fragment>
                    )
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default MessagesList