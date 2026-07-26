import { useState, useEffect } from 'react'

interface ContactsProps {
	onBack: () => void
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

function Contacts ({onBack}: ContactsProps) {
	const [pseudoInput, setPseudoInput] = useState('')
	const [pending, setPending] = useState<PendingRequest[]>([])
	const [feedback, setFeedback] = useState<Feedback | null>(null)

	useEffect(() => {
		async function loadPendingRequests() {
			const res = await fetch('/friends/requests/incoming')
			if (res.ok) {
				const user = await res.json()
				setPending(user)
			}
		}
		loadPendingRequests()
	}, [])

	async function handleAccept(id:number) {
		const res = await fetch(`/friends/${id}/accept`, { method: 'PATCH'})
		if (res.ok)
			setPending((prev) => prev.filter((p) => p.id !== id))
	}

	async function handleDecline(id: number) {
		const res = await fetch(`/friends/${id}/decline`, { method: 'DELETE' })
		if (res.ok)
			setPending((prev) => prev.filter((p) => p.id !== id))
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

	return (
		<aside className="w-80 shrink-0 shadow-2xl rounded-3xl bg-white flex flex-col overflow-y-auto gap-2 p-2">
			<button
				type="button"
				onClick={onBack}
				className="text-blue-500 hover:underline">
				retour
			</button>
			<div className="bg-gray-100 rounded-3xl flex flex-col gap-2 p-4">
				<h2 className="font-semibold text-gray-700 mb-2">Ajouter un ami</h2>
				<div className="flex gap-2">
					<input
						value={pseudoInput}
						onChange={(e) => setPseudoInput(e.target.value)}
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
		</aside>
	)
}

export default Contacts
