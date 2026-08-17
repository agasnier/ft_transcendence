import { useState, useEffect } from 'react'
import { useOnlineUsers } from '../../hooks/presence'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface ChatHeaderProps {
	channel: Channel
	UserId: number | null
	onOpenInfoPanel: () => void
}

function ChatHeader({channel, UserId, onOpenInfoPanel}: ChatHeaderProps) {
	const [memberCount, setMemberCount] = useState<number | null>(null)
	const [otherUserId, setOtherUserId] = useState<number | null>(null)
	const onlineUserIds = useOnlineUsers()

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

	useEffect(() => {
		if (channel.type !== 'discussion') {
			setOtherUserId(null)
			return
		}

		let cancelled = false
		async function resolveOther() {
			const membersRes = await fetch(`/chat/channels/${channel.id}/members`)
			if (membersRes.ok) {
				const members = await membersRes.json() as { userId: number }[]
				const other = members.find((m) => m.userId !== UserId)
				if (other) {
					if (!cancelled)
						setOtherUserId(other.userId)
					return
				}
			}

			const friendsRes = await fetch('/friends')
			if (!friendsRes.ok)
				return
			const friends = await friendsRes.json() as { id: number; pseudo: string }[]
			const match = friends.find((f) => f.pseudo === channel.name)
			if (!cancelled)
				setOtherUserId(match?.id ?? null)
		}
		resolveOther()
		return () => { cancelled = true }
	}, [channel.id, channel.type, channel.name, UserId])

	const isOnline = otherUserId !== null ? onlineUserIds.has(otherUserId) : null

	return (
		<div
			onClick={onOpenInfoPanel}
			className="flex p-1 border-b bg-white items-center gap-4 min-w-0 cursor-pointer">
			<span
				className="avatar-circle bg-orange-400 font-thin w-10 h-10">
				{channel.name?.charAt(0).toUpperCase()}
			</span>
			<div className="flex flex-col min-w-0">
				<h1 className="font-bold text-gray-800 text-lg truncate">{channel.name}</h1>
				<span className="text-black/50 truncate">
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
