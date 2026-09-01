import { useState, useEffect } from 'react'
import MessageInput from './ui/MessageInput'
import MessagesList from './ui/MessagesList'
import ChatHeader from './ui/ChatHeader'

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

interface Channel {
    id: number
    name: string | null
    description: string | null
    type: 'channel' | 'group' | 'discussion'
    avatarUrl?: string | null
    writeMode?: 'everyone' | 'moderators_only'
}

interface ChatWindowProps {
    channel: Channel
    userId: number | null
    role: 'admin' | 'user' | null
    messages: Message[]
    onSendMessage: (content: string) => void
    onSendFile: (file: File, onProgress?: (percent: number) => void) => Promise<boolean>
    onEditMessage: (messageId: number, content: string) => Promise<boolean>
    onDeleteMessage: (messageId: number) => Promise<boolean>
    onOpenInfoPanel: () => void
    onBack?: () => void
}

function ChatWindow({ channel, userId, role, messages, onSendMessage, onSendFile, onEditMessage, onDeleteMessage, onOpenInfoPanel, onBack }: ChatWindowProps) {
    const [canWrite, setCanWrite] = useState(true)
    const [myChannelRole, setMyChannelRole] = useState<'moderator' | 'member' | null>(null)

    useEffect(() => {
        async function checkWritePermission() {
            // discussion and channel are free writing
            if (channel.type === 'discussion') {
                setCanWrite(true)
                return
            }

            // fetch my role in this channel (used both for write-permission and for message management buttons)
            const membersRes = await fetch(`/chat/channels/${channel.id}/members`)
            if (!membersRes.ok) {
                setMyChannelRole(null)
                if (channel.writeMode === 'moderators_only' && role !== 'admin') setCanWrite(false)
                return
            }
            const members: { userId: number; role: 'moderator' | 'member' }[] = await membersRes.json()
            const me = members.find((m) => m.userId === userId)
            setMyChannelRole(me?.role ?? null)

            if (channel.writeMode !== 'moderators_only' || role === 'admin') {
                setCanWrite(true)
                return
            }

            setCanWrite(me?.role === 'moderator')
        }
        checkWritePermission()
    }, [channel.id, channel.type, channel.writeMode, userId, role])

    return (
        <main className="w-full h-full max-w-175 mx-auto flex flex-col bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
             <ChatHeader
                channel={channel}
                onOpenInfoPanel={onOpenInfoPanel}
                onBack={onBack}/>
                <MessagesList
                    messages={messages}
                    userId={userId}
                    role={role}
                    myChannelRole={myChannelRole}
                    channelType={channel.type}
                    onEditMessage={onEditMessage}
                    onDeleteMessage={onDeleteMessage}/>
            <MessageInput
                onSendMessage={onSendMessage}
                onSendFile={onSendFile}
                disabled={!canWrite}/>
        </main>
    )
}

export default ChatWindow
