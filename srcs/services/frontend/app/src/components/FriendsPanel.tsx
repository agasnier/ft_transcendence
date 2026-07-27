import { useState } from 'react'
import { usePolling } from '../hooks/usePolling'

interface FriendsPanelProps {
	searchQuery: string
}

interface Friend {
	id: number
	pseudo: string
	avatarUrl: string | null
	isOnline: boolean | null
}

interface PendingRequest {
	id: number
	pseudo: string
	displayName: string | null
}

interface Feedback {
	type: 'success' | 'error'
	text: string
}

function FriendsPanel({ searchQuery }: FriendsPanelProps) {
	const [friends, setFriends] = useState<Friend[]>([])
	const [pending, setPending] = useState<PendingRequest[]>([])
	const [pseudoInput, setPseudoInput] = useState('')
	const [feedback, setFeedback] = useState<Feedback | null>(null)

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

	async function handleAddByPseudo() {
		const pseudo = pseudoInput.trim()
		if (pseudo === '')
			return

		const usersRes = await fetch('/users')
		if (!usersRes.ok) {
			setFeedback({ type: 'error', text: "Impossible de contacter le serveur" })
			return
		}
		const allUsers: { id: number, pseudo: string }[] = await usersRes.json()
		const target = allUsers.find((u) => u.pseudo === pseudo)
		if (!target) {
			setFeedback({ type: 'error', text: 'Utilisateur introuvable' })
			return
		}

		const res = await fetch(`/friends/${target.id}`, { method: 'POST' })
		if (res.ok) {
			setFeedback({ type: 'success', text: 'Demande envoyée' })
			setPseudoInput('')
			return
		}

		let text = "Impossible d'envoyer la demande"
		try {
			const body = await res.json()
			if (body?.message)
				text = body.message
		} catch {
		}
		setFeedback({ type: 'error', text })
	}

	const filteredFriends = friends.filter((f) =>
		f.pseudo.toLowerCase().includes(searchQuery.toLowerCase())
	)

	return (
		<>
			<div className="bg-gray-100 rounded-3xl flex flex-col gap-2 p-4">
				<h2 className="font-semibold text-gray-700 mb-2">Ajouter un ami</h2>
				<div className="flex gap-2">
					<input
						value={pseudoInput}
						onChange={(e) => {
							const value = e.target.value
							setPseudoInput(value)
							if (value.trim() === '')
								setFeedback(null)
							}
						}
						placeholder='Pseudo'
						className="peer min-w-0 flex-1 border border-gray-300 rounded-3xl px-3 py-2 hover:border-blue-500 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-blue-500">
					</input>
					<button
						type="button"
						onClick={handleAddByPseudo}
						className="text-xs bg-blue-500 text-white rounded-full px-3 py-1 hover:bg-blue-600">
						Ajouter
					</button>
				</div>
				{feedback && (
					<p className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
						{feedback.text}
					</p>
				)}
			</div>
			<div className="bg-gray-100 rounded-3xl p-4">
				<h2 className="font-semibold text-gray-700 mb-2">Demandes reçues</h2>
				{pending.length === 0 ? (
					<p className="text-sm text-gray-400">Aucune demande</p>
				) : (
					<ul className="flex flex-col gap-1">
						{pending.map((request) => (
							<li key={request.id} className="flex items-center justify-between rounded-2xl">
								<span className="text-sm text-gray-700">{request.displayName ?? request.pseudo}</span>
								<span className="flex gap-1">
									<button type="button" onClick={() => handleAccept(request.id)} className="text-xs bg-blue-500 text-white rounded-full px-2 py-1 hover:bg-blue-600">Accepter</button>
									<button type="button" onClick={() => handleDecline(request.id)} className="text-xs bg-gray-300 text-gray-700 rounded-full px-2 py-1 hover:bg-gray-400">Refuser</button>
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
			<div className="bg-gray-100 rounded-3xl p-4">
				<h2 className="font-semibold text-gray-700 mb-2">Amis</h2>
				{filteredFriends.length === 0 ? (
					<p className="text-sm text-gray-400">Aucun ami</p>
				) : (
					<ul className="flex flex-col gap-1">
						{filteredFriends.map((friend) => (
							<li key={friend.id} className="group flex items-center justify-between gap-2 px-2 py-1 rounded-2xl hover:bg-gray-200">
								<span className="flex items-center gap-2">
									<span className="relative">
										<span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
											{friend.pseudo?.charAt(0).toUpperCase() ?? '?'}
										</span>
										<span
											className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-100 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
										/>
									</span>
									<span className="text-sm text-gray-700">{friend.pseudo}</span>
								</span>
								<span className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										type="button"
										title="Message privé"
										className="text-lg bg-gray-200 text-gray-600 rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-300">
										➣
									</button>
									<button
										type="button"
										onClick={() => handleRemoveFriend(friend.id)}
										title="Retirer l'ami"
										className="text-xs bg-gray-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-100">
										❌
									</button>
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	)
}

export default FriendsPanel
