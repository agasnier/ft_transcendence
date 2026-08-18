import { useEffect, useRef, Fragment } from 'react'

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
    channelType: 'channel' | 'group' | 'discussion'
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
            <span className="text-2xl">📄</span>
            <span className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{file.originalName}</span>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
            </span>
        </a>
    )
}

function MessagesList({messages, userId, channelType}: MessagesListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col min-w-0 p-3 rounded-2xl max-w-md shadow-sm
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
                                {msg.file ? (
                                    <FileAttachment file={msg.file} />
                                ) : (
                                    <p className="text-gray-800 whitespace-pre-wrap wrap-break-word min-w-0 w-full">{msg.content}</p>
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