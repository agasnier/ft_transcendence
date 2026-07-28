import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import { useReconnectingSocket } from './hooks/useReconnectingSocket'
import bg from './assets/site.webp'

interface MainAppProp {
	onLogout: () => void
	pseudo: string | null
	userId: number | null
}

interface Room {
	id: number
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

function MainApp({onLogout, pseudo, userId}: MainAppProp) {
	const [rooms, setRooms] = useState<Room[]>([])
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
	const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null

	// route to backend via websocket
	async function handleCreateRoom(name: string, _description: string, _type: Room['type']) {
		await fetch('/chat/channels', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({name})
		})
	}

	// manage keyword Escape
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setSelectedRoomId(null)
				;(document.activeElement as HTMLElement)?.blur()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [])

	// load the room list on startup
	useEffect(() => {
		async function loadChannels() {
			const res = await fetch('/chat/channels')
			if (!res.ok)
				return

			const channelsFromServer: {id: number; name: string; createdAt: string}[] = await res.json()
			const fetchedRooms: Room[] = channelsFromServer.map((channel) => ({
				id: channel.id,
				name: channel.name,
				description: '',
				type: 'channel',
			}))
			setRooms(fetchedRooms)
		}
		loadChannels()
	}, [])

	// chat_service websocket url
	const channelEventsSocketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat/ws`

	// refresh the room list in real time
	useReconnectingSocket(channelEventsSocketUrl, (message) => {
		if (message.type === 'CHANNEL_CREATED') {
			const createdChannel = message.payload
			setRooms((prev) =>
				prev.some((r) => r.id === createdChannel.id)
					? prev
					: [...prev, {id: createdChannel.id, name: createdChannel.name, description: '', type: 'channel'}]
			)
		}
		if (message.type === 'CHANNEL_DELETED') {
			setRooms((prev) => prev.filter((r) => r.id !== message.payload.id))
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
								rooms={rooms}
								selectedRoomId={selectedRoomId}
								onSelectRoom={setSelectedRoomId}
								onCreateRoom={handleCreateRoom}
							/>
							{selectedRoom && <ChatWindow room={selectedRoom} userId={userId}/>}
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default MainApp
