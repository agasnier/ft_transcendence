import AvatarNameCard from './AvatarNameCard'
import { useOnlineUsers, useUserAvatars } from '../../../hooks/presence'

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
	avatarUrl?: string | null
	otherUserId?: number
	hasUnread?: boolean
	memberCount?: number
}

function ConversationsPanel({ isSearching, searchQuery, channels, selectedChannelId, onSelectChannel }: ConversationsPanelProps) {
	const onlineUserIds = useOnlineUsers()
	const userAvatars = useUserAvatars()
	const filteredChannels = channels.filter((c) => {
		const live = c.otherUserId !== undefined ? userAvatars.get(c.otherUserId) : undefined
		const name = c.type === 'discussion' ? (live?.pseudo ?? c.name ?? '') : (c.name ?? '')
		return name.toLowerCase().includes(searchQuery.toLowerCase())
	})

	if (filteredChannels.length === 0) {
		return (
			<div className={`${isSearching ? 'bg-white' : 'bg-gray-100'} rounded-3xl p-4`}>
				<p className="text-sm text-gray-400">Aucune conversation</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-1">
			{filteredChannels.map((channel) => {
				const live = channel.otherUserId !== undefined ? userAvatars.get(channel.otherUserId) : undefined
				return (
					<AvatarNameCard
						key={channel.id}
						name={(channel.type === 'discussion'
							? (channel.otherUserId !== undefined ? live?.pseudo : undefined) ?? channel.name
							: channel.name) ?? '?'}
						avatarUrl={channel.type === 'discussion' && channel.otherUserId !== undefined
							&& live?.avatarUrl !== undefined
							? live?.avatarUrl
							: channel.avatarUrl}
						variant={channel.type === 'discussion' ? 'user' : 'conversation'}
						selected={selectedChannelId === channel.id}
						onClick={() => onSelectChannel(channel.id)}
						isOnline={
							channel.type === 'discussion' && channel.otherUserId !== undefined
								? onlineUserIds.has(channel.otherUserId)
								: undefined
						}
						hasUnread={channel.hasUnread}
						subtitle={channel.type !== 'discussion' && channel.memberCount !== undefined
									? `${channel.memberCount} ${channel.type === 'group' ? 'membre' : 'abonné'}${channel.memberCount > 1 ? 's' : ''}`
									: undefined}
					/>
				)
			})}
		</div>
	)
}

export default ConversationsPanel
