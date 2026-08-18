import { useState } from 'react'
import { useReconnectingSocket } from '../hooks/useReconnectingSocket'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
	avatarUrl?: string | null
	memberIds?: number[]
	hasUnread?: boolean
}

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

export function useChatSocket(
	addChannel: (channel: Channel) => void,
	removeChannel: (id: number) => void,
	updateChannel: (channel: Channel) => void,
	addMessage: (message: Message) => void,
	setChannelUnread: (id: number, hasUnread: boolean) => void,
	userId: number | null,
	selectedChannelId: number | null,
	updateMessage?: (message: Message) => void,
    removeMessage?: (messageId: number) => void,
) {
	const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(() => new Set())
	const chatSocketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat/ws`

	useReconnectingSocket(chatSocketUrl, (message) => {
		if (message.type === 'CHANNEL_CREATED')
			addChannel({ ...message.payload, hasUnread: true })
		if (message.type === 'CHANNEL_DELETED')
			removeChannel(message.payload.id)
		if (message.type === 'CHANNEL_UPDATED')
			updateChannel(message.payload)
		if (message.type === 'MESSAGE_CREATED') {
			addMessage(message.payload)
			if (userId !== null && message.payload.senderId !== userId && message.payload.channelId !== selectedChannelId)
				setChannelUnread(message.payload.channelId, true)
		}
		if (message.type === 'MESSAGE_UPDATED' && updateMessage)
            updateMessage(message.payload)
        if (message.type === 'MESSAGE_DELETED' && removeMessage)
            removeMessage(message.payload.id)
		if (message.type === 'PRESENCE_SNAPSHOT')
			setOnlineUserIds(new Set(message.payload.userIds))
		if (message.type === 'USER_ONLINE') {
			setOnlineUserIds((prev) => {
				if (prev.has(message.payload.userId))
					return prev
				const next = new Set(prev)
				next.add(message.payload.userId)
				return next
			})
		}
		if (message.type === 'USER_OFFLINE') {
			setOnlineUserIds((prev) => {
				if (!prev.has(message.payload.userId))
					return prev
				const next = new Set(prev)
				next.delete(message.payload.userId)
				return next
			})
		}
	})

	return onlineUserIds
}
