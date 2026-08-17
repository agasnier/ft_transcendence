import { useState } from 'react'
import { usePolling } from '../../../hooks/usePolling'
import { useClickOutside } from '../../../hooks/useClickOutside'
import AddFriendForm from './AddFriendForm'
import PendingRequestsList from './PendingRequestsList'
import FriendsList from './FriendsList'

interface FriendsPanelProps {
	searchQuery: string
	isSearching: boolean
	userId: number | null
	onCreateChannel: (type: 'discussion', memberIds: number[], name?: string, description?: string) => Promise<{ id: number } | null>
	onSelectChannel: (id: number) => void
}

interface Friend {
	id: number
	pseudo: string
	avatarUrl: string | null
}

interface PendingRequest {
	id: number
	pseudo: string
	displayName: string | null
}

function FriendsPanel({ searchQuery, isSearching, userId, onCreateChannel, onSelectChannel }: FriendsPanelProps) {
	const [friends, setFriends] = useState<Friend[]>([])
	const [pending, setPending] = useState<PendingRequest[]>([])
	const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)

	useClickOutside(confirmRemoveId !== null, '[data-remove-popover]', () => setConfirmRemoveId(null))

	usePolling(async () => {
		const [friendsRes, pendingRes] = await Promise.all([
			fetch('/friends'),
			fetch('/friends/requests/incoming'),
		])
		if (friendsRes.ok)
			setFriends(await friendsRes.json())
		if (pendingRes.ok)
			setPending(await pendingRes.json())
	}, 5000)

	async function handleAccept(id: number) {
		const res = await fetch(`/friends/${id}/accept`, { method: 'PATCH' })
		if (res.ok)
			setPending((prev) => prev.filter((p) => p.id !== id))
	}

	async function handleDecline(id: number) {
		const res = await fetch(`/friends/${id}/decline`, { method: 'DELETE' })
		if (res.ok)
			setPending((prev) => prev.filter((p) => p.id !== id))
	}

	async function handleRemoveFriend(id: number) {
		const res = await fetch(`/friends/${id}`, { method: 'DELETE' })
		if (res.ok)
			setFriends((prev) => prev.filter((f) => f.id !== id))
	}

	async function handleMessagePrivate(friendId: number) {
		if (userId === null) return
		const channel = await onCreateChannel('discussion', [userId, friendId])
		if (channel)
			onSelectChannel(channel.id)
	}



	const filteredFriends = friends.filter((f) =>
		f.pseudo.toLowerCase().includes(searchQuery.toLowerCase())
	)

	return (
		<>
			{!isSearching && (<AddFriendForm/>)}
			{!isSearching && (<PendingRequestsList pending={pending} onAccept={handleAccept} onDecline={handleDecline}/>)}
			<FriendsList
				friends={filteredFriends}
				isSearching={isSearching}
				confirmRemoveId={confirmRemoveId}
				setConfirmRemoveId={setConfirmRemoveId}
				onRemove={handleRemoveFriend}
				onMessagePrivate={handleMessagePrivate}
			/>
		</>
	)
}

export default FriendsPanel
