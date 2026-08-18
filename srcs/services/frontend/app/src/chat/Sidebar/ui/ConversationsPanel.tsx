import AvatarNameCard from './AvatarNameCard'
import { useOnlineUsers } from '../../../hooks/presence'

interface ConversationsPanelProps {
	isSearching: boolean
	searchQuery: string
	channels: Channel[]
	selectedChannelId: number | null
	onSelectChannel: (id: number) => void
}

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
	otherUserId?: number
}

function ConversationsPanel({ isSearching, searchQuery, channels, selectedChannelId, onSelectChannel }: ConversationsPanelProps) {
	const onlineUserIds = useOnlineUsers()
	const filteredChannels = channels.filter((c) =>
		(c.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
	)

	if (filteredChannels.length === 0) {
		return (
			<div className={`${isSearching ? 'bg-white' : 'bg-gray-100'} rounded-3xl p-4`}>
				<p className="text-sm text-gray-400">Aucune conversation</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-1">
			{filteredChannels.map((channel) => (
				<AvatarNameCard
					key={channel.id}
					name={channel.name ?? 'username a gerer'}
					variant={channel.type === 'discussion' ? 'user' : 'conversation'}
					selected={selectedChannelId === channel.id}
					onClick={() => onSelectChannel(channel.id)}
					isOnline={
						channel.type === 'discussion' && channel.otherUserId !== undefined
							? onlineUserIds.has(channel.otherUserId)
							: undefined
					}
				/>
			))}
		</div>
	)
}

export default ConversationsPanel
