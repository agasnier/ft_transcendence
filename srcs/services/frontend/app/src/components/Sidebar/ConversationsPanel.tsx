interface ConversationsPanelProps {
	isSearching: boolean
	searchQuery: string
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

function ConversationsPanel({ isSearching, searchQuery, rooms, selectedRoomId, onSelectRoom }: ConversationsPanelProps) {
	const filteredRooms = rooms.filter((r) =>
		(r.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
	)

	if (filteredRooms.length === 0) {
		return (
			<div className={`${isSearching ? 'bg-white' : 'bg-gray-100'} rounded-3xl p-4`}>
				<p className="text-sm text-gray-400">Aucune conversation</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-1">
			{filteredRooms.map((room) => (
				<button
					key={room.id}
					onClick={() => onSelectRoom(room.id)}
					className={`flex text-left font-bold px-3 py-2 rounded-2xl ${selectedRoomId === room.id ? 'bg-blue-400' : 'hover:bg-gray-100'} `}>
					<span
						className="bg-orange-400/90 text-white text-2xl font-thin rounded-full w-15 h-15 flex items-center justify-center shrink-0">
						{room.name?.charAt(0).toUpperCase() ?? '?'}
					</span>
					<span className={`truncate min-w-0 px-3 ${selectedRoomId === room.id ? 'text-white' : ''}`}>{room.name ?? 'Channel'}</span>
				</button>
			))}
		</div>
	)
}

export default ConversationsPanel
