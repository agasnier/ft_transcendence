import AvatarNameCard from './AvatarNameCard'

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
		r.name.toLowerCase().includes(searchQuery.toLowerCase())
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
				<AvatarNameCard
					key={room.id}
					name={room.name}
					selected={selectedRoomId === room.id}
					onClick={() => onSelectRoom(room.id)}
				/>
			))}
		</div>
	)
}

export default ConversationsPanel
