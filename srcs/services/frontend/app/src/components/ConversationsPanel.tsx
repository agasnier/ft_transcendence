interface ConversationsPanelProps {
	isSearching: boolean
	rooms: Room[]
	selectedRoomId: number | null
	onSelectRoom: (id: number) => void
}

interface Room {
	id: number
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

function ConversationsPanel({ isSearching, rooms, selectedRoomId, onSelectRoom }: ConversationsPanelProps) {
	const typeIcon = { channel: '📢', group: '👥', discussion: '👤' }

	if (rooms.length === 0) {
		return (
			<div className={`${isSearching ? 'bg-white' : 'bg-gray-100'} rounded-3xl p-4`}>
				<p className="text-sm text-gray-400">Aucune conversation</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-1">
			{rooms.map((room) => (
				<button
					key={room.id}
					onClick={() => onSelectRoom(room.id)}
					className={`text-left px-3 py-2 rounded-2xl ${isSearching ? 'bg-white' : 'bg-gray-100'} ${selectedRoomId === room.id ? 'ring-2 ring-blue-400' : ''} hover:bg-blue-50`}>
					{typeIcon[room.type]} {room.name}
				</button>
			))}
		</div>
	)
}

export default ConversationsPanel
