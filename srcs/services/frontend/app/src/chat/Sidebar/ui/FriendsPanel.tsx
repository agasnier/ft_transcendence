import { useState } from 'react'
import { usePolling } from '../../../hooks/usePolling'
import { useClickOutside } from '../../../hooks/useClickOutside'
import RequestsList from './RequestsList'
import AddFriendForm from './AddFriendForm'
import FriendsList from './FriendsList'
import { useUserAvatars } from '../../../hooks/presence'

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
	const [outgoing, setOutgoing] = useState<PendingRequest[]>([])
	const userAvatars = useUserAvatars()

	useClickOutside(confirmRemoveId !== null, '[data-remove-popover]', () => setConfirmRemoveId(null))

	// Friends/requests have no websocket event, unlike channels/messages, so this polls instead
	usePolling(async () => {
		const [friendsRes, pendingRes, outgoingRes] = await Promise.all([
			fetch('/friends'),
			fetch('/friends/requests/incoming'),
			fetch('/friends/requests/outgoing'),
		])
		if (friendsRes.ok)
			setFriends(await friendsRes.json())
		if (pendingRes.ok)
			setPending(await pendingRes.json())
		if (outgoingRes.ok)
			setOutgoing(await outgoingRes.json())
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
		(userAvatars.get(f.id)?.pseudo ?? f.pseudo).toLowerCase().includes(searchQuery.toLowerCase())
	)

	return (
		<>
			{!isSearching && (<AddFriendForm/>)}
			{!isSearching && (
				<RequestsList
					title="Demandes reçues"
					emptyText="Aucune demande"
					requests={pending}
					renderAction={(request) => (
						<span className="flex gap-1">
							<button
								type="button"
								onClick={() => handleAccept(request.id)}
								className="text-xs bg-user text-white rounded-full px-2 py-1 hover:bg-blue-600">
								Accepter
							</button>
							<button
								type="button"
								onClick={() => handleDecline(request.id)}
								className="text-xs bg-gray-300 text-gray-700 rounded-full px-2 py-1 hover:bg-gray-400">
								Refuser
							</button>
						</span>
					)}
				/>)}
			{!isSearching && (
				<RequestsList
					title="Demandes envoyées"
					emptyText='Aucune demande envoyée'
					requests={outgoing}
					renderAction={() => <span className="text-xs text-gray-400">En attente</span>}
				/>)}
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
