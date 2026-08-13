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
}

interface ChatWindowProps {
	channel: Channel
	userId: number | null
	messages: Message[]
	onSendMessage: (content: string) => void
	onDeleteChannel: (id: number) => void
	onRenameChannel: (id: number, name: string) => Promise<boolean>
}

function ChatWindow({ channel, userId, messages, onSendMessage, onDeleteChannel, onRenameChannel }: ChatWindowProps) {
	return (
		<main className="flex-1 flex flex-col bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
			<ChatHeader
				channel={channel}
				UserId={userId}
				onDeleteChannel={onDeleteChannel}
				onRenameChannel={onRenameChannel}
			/>
			<MessagesList
				messages={messages}
				userId={userId}
				channelType={channel.type}/>
			<MessageInput
				onSendMessage={onSendMessage}/>
		</main>
	)
}

export default ChatWindow
