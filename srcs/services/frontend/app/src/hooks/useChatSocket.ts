import { useReconnectingSocket } from '../hooks/useReconnectingSocket'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
	memberIds?: number[]
}

interface Message {
	id: number
	channelId: number
	senderId: number
	senderPseudo: string | null
	content: string
	createdAt: string
}

export function useChatSocket(
	addChannel: (channel: Channel) => void,
	removeChannel: (id: number) => void,
	addMessage: (message: Message) => void,
) {
	const chatSocketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat/ws`

	useReconnectingSocket(chatSocketUrl, (message) => {
		if (message.type === 'CHANNEL_CREATED')
			addChannel(message.payload)
		if (message.type === 'CHANNEL_DELETED')
			removeChannel(message.payload.id)
		if (message.type === 'MESSAGE_CREATED')
			addMessage(message.payload)
	})
}
