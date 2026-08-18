import { useState } from 'react'

interface Feedback {
	type: 'success' | 'error'
	text: string
}

function AddFriendForm() {
	const [pseudoInput, setPseudoInput] = useState('')
	const [feedback, setFeedback] = useState<Feedback | null>(null)

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
					autoComplete="off"
					onKeyDown={(e) => {
						if (e.key === 'Escape')
							e.currentTarget.blur()
					}}
					maxLength={255}
					className="peer min-w-0 flex-1 border border-gray-300 rounded-3xl px-3 py-2 hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white">
				</input>
				<button
					type="button"
					onClick={handleAddByPseudo}
					className="text-xs bg-user text-white rounded-full px-3 hover:bg-blue-600">
					Ajouter
				</button>
			</div>
			{feedback && (
				<p className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
					{feedback.text}
				</p>
			)}
		</div>
	)
}

export default AddFriendForm
