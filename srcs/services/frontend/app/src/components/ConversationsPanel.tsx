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
					className={`flex text-left font-bold px-3 py-2 rounded-2xl ${selectedRoomId === room.id ? 'bg-blue-400' : 'hover:bg-gray-100'} `}>
					<span
						className="bg-blue-500 text-white text-lg rounded-full w-15 h-15 flex items-center justify-center">
						{room.name?.charAt(0).toUpperCase() ?? '?'}
					</span>
					<span className={`truncate px-3 ${selectedRoomId === room.id ? 'text-white' : ''}`}>{room.name ?? 'Channel'}</span>
				</button>
			))}
		</div>
	)
}

export default ConversationsPanel
