import { useState, useEffect } from 'react'
import MessageInput from './MessageInput'
import MessagesList from './MessagesList'
import ChatHeader from './ChatHeader'

interface Message {
    id: number
    channelId: number
    senderId: number
    senderPseudo: string | null
    content: string
    createdAt: string
    type: 'user' | 'system'
}

interface Channel {
    id: number
    name: string | null
    description: string | null
    type: 'channel' | 'group' | 'discussion'
    writeMode?: 'everyone' | 'moderators_only'
}

interface ChatWindowProps {
    channel: Channel
    userId: number | null
    messages: Message[]
    onSendMessage: (content: string) => void
    onOpenInfoPanel: () => void
}

function ChatWindow({ channel, userId, messages, onSendMessage, onOpenInfoPanel }: ChatWindowProps) {
    const [canWrite, setCanWrite] = useState(true)

    useEffect(() => {
        async function checkWritePermission() {
            // discussion and channel are free writing
            if (channel.type === 'discussion' || channel.writeMode !== 'moderators_only') {
                setCanWrite(true)
                return
            }

            // bypass admin global
            const profileRes = await fetch('/users/profile')
            if (profileRes.ok) {
                const profile = await profileRes.json()
                if (profile.role === 'admin') {
                    setCanWrite(true)
                    return
                }
            }

            // check role in specific channel
            const membersRes = await fetch(`/chat/channels/${channel.id}/members`)
            if (!membersRes.ok) {
                setCanWrite(false)
                return
            }
            const members: { userId: number; role: 'moderator' | 'member' }[] = await membersRes.json()
            const me = members.find((m) => m.userId === userId)
            setCanWrite(me?.role === 'moderator')
        }
        checkWritePermission()
    }, [channel.id, channel.type, channel.writeMode, userId])

    return (
        <main className="w-full h-full max-w-175 mx-auto flex flex-col bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <ChatHeader
                channel={channel}
                UserId={userId}
                onOpenInfoPanel={onOpenInfoPanel}
            />
            <MessagesList
                messages={messages}
                userId={userId}
                channelType={channel.type}/>
            <MessageInput
                onSendMessage={onSendMessage}
                disabled={!canWrite}/>
        </main>
    )
}

export default ChatWindow