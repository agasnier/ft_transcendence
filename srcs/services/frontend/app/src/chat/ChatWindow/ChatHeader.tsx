import { useState, useEffect } from 'react'
import { usePolling } from '../../hooks/usePolling'

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

function ChatHeader({channel, onOpenInfoPanel}: ChatHeaderProps) {
	const [memberCount, setMemberCount] = useState<number | null>(null)
	const [isOnline, setIsOnline] = useState<boolean | null>(null)

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

	usePolling(async () => {
		if (channel.type !== 'discussion')
			return

		const res = await fetch('/friends')
		if (!res.ok)
			return

		const friends = await res.json() as { pseudo: string; isOnline: boolean }[]
		const match = friends.find((f) => f.pseudo === channel.name)
		setIsOnline(match?.isOnline ?? null)
	}, 5000)

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
