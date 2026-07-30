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
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

interface Message {
	id: number
	channelId: number
	senderId: number
	content: string
	createdAt: string
}

// hook for channel -> function are now in variable reusable by chat()
// romms rename into channels
// simplify the function load with return from fucntion channels from chat service
// hook for message


function useChannel(userId: number | null) {
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

	async function createChannel(name: string, description: string, type: Channel['type']) {
		await fetch('/chat/channels', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({name, description, type, memberIds: [userId]})
		})
	}

	// chat_service websocket url
	const channelEventsSocketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat/ws`

	// refresh the channel list in real time
	useReconnectingSocket(channelEventsSocketUrl, (message) => {
		if (message.type === 'CHANNEL_CREATED') {
			const createdChannel = message.payload
			setChannels((prev) =>
				prev.some((c) => c.id === createdChannel.id)
					? prev
					: [...prev, createdChannel]
			)
		}
		if (message.type === 'CHANNEL_DELETED') {
			setChannels((prev) => prev.filter((c) => c.id !== message.payload.id))
		}
	})

	return {
		channels,
		createChannel,
	}
}

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

	return {
		messages, createMessage
	}
}

function Chat({onLogout, pseudo, userId}: ChatProps) {
	const { channels, createChannel } = useChannel(userId)
	const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
	const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? null
	const { messages, createMessage } = useMessage(selectedChannelId)

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
								channels={channels}
								selectedChannelId={selectedChannelId}
								onSelectChannel={setSelectedChannelId}
								onCreateChannel={createChannel}
							/>
							{selectedChannel && <ChatWindow channel={selectedChannel} userId={userId} messages={messages} onSendMessage={createMessage}/>}
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default Chat
