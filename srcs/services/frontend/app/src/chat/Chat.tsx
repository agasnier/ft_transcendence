import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar/Sidebar'
import ChatWindow from './ChatWindow'
import { useReconnectingSocket } from '../hooks/useReconnectingSocket'
import bg from '../assets/site.webp'

interface ChatProps {
	onLogout: () => void
	pseudo: string | null
	userId: number | null
}

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

// hook channel function
function useChannel() {
	const [channels, setChannels] = useState<Channel[]>([])

	// load the channel list on startup
	useEffect(() => {
		async function loadChannels() {
			const res = await fetch('/chat/channels')
			if (!res.ok)
				return
			setChannels(await res.json())
		}
		loadChannels()
	}, [])

	async function createChannel(
		type: Channel['type'],
		memberIds: number[],
		name?: string,
		description?: string,
	): Promise<Channel | null> {
		const res = await fetch('/chat/channels', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ type, memberIds, name, description }),
		})
		if (!res.ok) return null
		const channel = await res.json()
		addChannel(channel)
		return channel
	}

	async function deleteChannel(id: number): Promise<boolean> {
		const res = await fetch(`/chat/channels/${id}`, { method: 'DELETE' })
		return res.ok
	}

	function addChannel(channel: Channel) {
		setChannels((prev) =>
			prev.some((c) => c.id === channel.id)
				? prev
				: [...prev, channel]
		)
	}

	function removeChannel(id: number) {
		setChannels((prev) => prev.filter((c) => c.id !== id))
	}

	return {
		channels,
		createChannel,
		deleteChannel,
		addChannel,
		removeChannel,
	}
}

// hook message function
function useMessage(channelId: number | null) {
	const [messages, setMessages] = useState<Message[]>([])

	// load messages when selected channel changes
	useEffect(() => {
		if (channelId === null) {
			setMessages([])
			return
		}
		async function loadMessages() {
			const res = await fetch(`/chat/channels/${channelId}/messages`)
			if (!res.ok)
				return
			setMessages(await res.json())
		}
		loadMessages()
	}, [channelId])

	async function createMessage(content: string) {
	if (channelId === null) return
	await fetch(`/chat/channels/${channelId}/messages`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ content }),
	})
	}

	function addMessage(message: Message) {
		if (channelId === null || message.channelId !== channelId) return
		setMessages((prev) =>
			prev.some((m) => m.id === message.id)
				? prev
				: [...prev, message]
		)
	}

	return {
		messages,
		createMessage,
		addMessage,
	}
}

// open the chat websocket and route event type → action
function useChatSocket(
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

function Chat({onLogout, pseudo, userId}: ChatProps) {
	const { channels, createChannel, deleteChannel, addChannel, removeChannel } = useChannel()
	const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
	const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? null
	const { messages, createMessage, addMessage } = useMessage(selectedChannelId)

	useChatSocket(addChannel, removeChannel, addMessage)

	async function handleDeleteChannel(id: number) {
		if (!(await deleteChannel(id))) return
		removeChannel(id)
		setSelectedChannelId(null)
	}

	// manage keyword Escape
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setSelectedChannelId(null)
				;(document.activeElement as HTMLElement)?.blur()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [])

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={
					<div className="flex flex-col h-screen">
						<img
							src={bg}
							className="absolute inset-0 -z-10 w-full h-full object-cover object-right"
						/>
						<div className="flex flex-1 overflow-hidden p-4 gap-4">
							<Sidebar
								onLogout={onLogout}
								pseudo={pseudo}
								userId={userId}
								channels={channels}
								selectedChannelId={selectedChannelId}
								onSelectChannel={setSelectedChannelId}
								onCreateChannel={createChannel}
							/>
							{selectedChannel && 
								<ChatWindow
									key={selectedChannel.id}
									channel={selectedChannel}
									userId={userId}
									messages={messages}
									onSendMessage={createMessage}
									onDeleteChannel={handleDeleteChannel}
								/>
							}
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default Chat
