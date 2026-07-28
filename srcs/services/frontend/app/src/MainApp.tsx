import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useState } from 'react'
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

function MainApp({onLogout, pseudo}: MainAppProp) {
	const [rooms, setRooms] = useState<Room[]>([])
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)

	function handleCreateRoom(name: string, description: string, type: Room['type']) {
		const newRoom: Room = { id: Date.now(), name, description, type }
		setRooms((prev) => [...prev, newRoom])
		setSelectedRoomId(newRoom.id)
	}

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
