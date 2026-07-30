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

// hook for channel -> function are now in variabkle reusable by chat()
// - channels rename into channels

function useChannel(userId: number | null) {
	const [channels, setChannels] = useState<Channel[]>([])

	// route to backend via websocket
	async function createChannel(name: string, _description: string, _type: Channel['type']) {
		await fetch('/chat/channels', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({name, memberIds: [userId]})
		})
	}

	// load the room list on startup
	useEffect(() => {
		async function loadChannels() {
			const res = await fetch('/chat/channels')
			if (!res.ok)
				return

			const channelsFromServer: {id: number; name: string; createdAt: string}[] = await res.json()
			const fetchedChannels: Channel[] = channelsFromServer.map((channel) => ({
				id: channel.id,
				name: channel.name,
				description: '',
				type: 'channel',
			}))
			setChannels(fetchedChannels)
		}
		loadChannels()
	}, [])

	return {
		channels,
		setChannels,
		createChannel,
	}
}

function Chat({onLogout, pseudo, userId}: ChatProps) {
	const { channels, setChannels, createChannel } = useChannel(userId)
	const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
	const selectedChannel = channels.find((r) => r.id === selectedChannelId) ?? null

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

	// chat_service websocket url
	const channelEventsSocketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat/ws`

	// refresh the room list in real time
	useReconnectingSocket(channelEventsSocketUrl, (message) => {
		if (message.type === 'CHANNEL_CREATED') {
			const createdChannel = message.payload
			setChannels((prev) =>
				prev.some((r) => r.id === createdChannel.id)
					? prev
					: [...prev, {id: createdChannel.id, name: createdChannel.name, description: '', type: 'channel'}]
			)
		}
		if (message.type === 'CHANNEL_DELETED') {
			setChannels((prev) => prev.filter((r) => r.id !== message.payload.id))
		}
	})

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
							{selectedChannel && <ChatWindow channel={selectedChannel} userId={userId}/>}
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default Chat
