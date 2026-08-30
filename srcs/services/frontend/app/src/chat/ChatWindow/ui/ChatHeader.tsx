import { useState, useEffect } from 'react'
import { useOnlineUsers, useUserAvatars } from '../../../hooks/presence'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
	avatarUrl?: string | null
	otherUserId?: number
}

interface ChatHeaderProps {
	channel: Channel
	onOpenInfoPanel: () => void
}

function ChatHeader({channel, onOpenInfoPanel}: ChatHeaderProps) {
	const [memberCount, setMemberCount] = useState<number | null>(null)
	const onlineUserIds = useOnlineUsers()
	const userAvatars = useUserAvatars()

	useEffect(() => {
		if (channel.type === 'discussion')
			return

		async function loadCount() {
			const res = await fetch(`/chat/channels/${channel.id}/members`)
			if (res.ok)
				setMemberCount((await res.json()).length)
		}
		loadCount()
	}, [channel.id, channel.type])

	const otherUserId = channel.type === 'discussion' ? (channel.otherUserId ?? null) : null
	const isOnline = otherUserId !== null ? onlineUserIds.has(otherUserId) : null

	const displayAvatar = otherUserId !== null && userAvatars.has(otherUserId)
		? userAvatars.get(otherUserId)
		: channel.avatarUrl

	return (
		<div
			onClick={onOpenInfoPanel}
			className="flex p-1 border-b bg-white items-center gap-4 min-w-0 cursor-pointer">
			{displayAvatar ? (
				<img
					src={displayAvatar}
					alt="logo"
					className="w-10 h-10 rounded-full object-cover shrink-0"
				/>
			) : (
				<span
					className={`avatar-circle font-thin w-10 h-10 shrink-0 ${channel.type === 'discussion' ? 'bg-user' : 'bg-conversation'}`}>
					{channel.name?.charAt(0).toUpperCase()}
				</span>
			)}
			<div className="flex flex-col min-w-0">
				<h1 className="font-bold text-gray-800 text-lg truncate">{channel.name}</h1>
				<span className="text-black/50 truncate min-h-6 block">
					{channel.type === 'discussion' && isOnline !== null && (
						<span className={`${isOnline ? 'text-green-500' : 'text-red-600'}`}>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
					)}
					{channel.type !== 'discussion' && memberCount !== null && (
						<span>{memberCount} {channel.type === 'group' ? 'membre' : 'abonné'}{memberCount > 1 ? 's' : ''}</span>
					)}
				</span>
			</div>
		</div>
	)
}

export default ChatHeader
