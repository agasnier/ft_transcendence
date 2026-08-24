import { useState } from 'react'
import AvatarNameCard from '../../Sidebar/ui/AvatarNameCard'
import { useFriends } from '../../../hooks/useFriends'

interface Member {
	userId: number
}

interface AddMembersFormProps {
	channelId: number
	members: Member[] | null
	onAddMembers?: (channelId: number, memberIds: number[]) => Promise<boolean>
	onAdded: () => void
}

function AddMembersForm({ channelId, members, onAddMembers, onAdded }: AddMembersFormProps) {
	const friends = useFriends()
	const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set())
	const [pseudoInput, setPseudoInput] = useState('')
	const [searchError, setSearchError] = useState<string | null>(null)
	const [extraUsers, setExtraUsers] = useState<{ id: number; pseudo: string; avatarUrl: string | null }[]>([])
	const existingMemberIds = new Set(members?.map((m) => m.userId) ?? [])
	const availableFriends = friends.filter((f) => !existingMemberIds.has(f.id))
	const selectableUsers = [
		...availableFriends,
		...extraUsers.filter((u) => !availableFriends.some((f) => f.id === u.id) && !existingMemberIds.has(u.id))
	]

	function toggleMemberSelect(id: number) {
		setSelectedMemberIds((prev) => {
			const next = new Set(prev)
			next.has(id) ? next.delete(id) : next.add(id)
			return next
		})
	}

	async function handleAddByPseudo() {
		const pseudo = pseudoInput.trim()
		if (pseudo === '')
			return

		const res = await fetch('/users')
		if (!res.ok) {
			setSearchError('Impossible de contacter le serveur')
			return
		}

		const allUsers: { id: number; pseudo: string; avatarUrl: string | null }[] = await res.json()
		const target = allUsers.find((u) => u.pseudo.toLowerCase() === pseudo.toLowerCase())
		if (!target) {
			setSearchError('Utilisateur introuvable')
			return
		}
		if (members?.some((m) => m.userId === target.id)) {
			setSearchError('Déjà membre du salon')
			return
		}
		if (selectedMemberIds.has(target.id)) {
			setSearchError('Déjà sélectionné')
			return			
		}

		setExtraUsers((prev) => prev.some((u) => u.id === target.id) ? prev : [...prev, target])
		setSelectedMemberIds((prev) => new Set([...prev, target.id]))
		setPseudoInput('')
		setSearchError(null)
	}

	async function handleConfirmAddMembers() {
		if (selectedMemberIds.size === 0 || !onAddMembers) return
		const ok = await onAddMembers(channelId, Array.from(selectedMemberIds))
		if (ok) {
			onAdded()
		}
	}

	return (
		<div className="flex flex-col gap-2 py-1 flex-1 overflow-y-auto">
			<div className="flex gap-2">
				<input
					value={pseudoInput}
					onChange={(e) => {
						setPseudoInput(e.target.value)
						if (e.target.value.trim() === '')
							setSearchError(null)
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault()
							handleAddByPseudo()
						}
					}}
					placeholder="Rechercher par pseudo"
					maxLength={255}
					className="min-w-0 flex-1 border border-gray-300 rounded-2xl px-2.5 py-1 text-xs hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
				/>
				<button
					type="button"
					onClick={handleAddByPseudo}
					className="text-xs bg-blue-500 text-white rounded-xl px-2.5 py-1 hover:bg-blue-600 font-semibold">
					Ajouter
				</button>
			</div>
			{searchError && <p className="text-xs text-red-600">{searchError}</p>}

			{selectableUsers.length === 0 ? (
				<p className="text-xs italic text-gray-400 py-3 text-center">Aucun utilisateur disponible</p>
			) : (
				<>
					<div className="flex flex-col gap-1 flex-1 overflow-y-auto">
						{selectableUsers.map((user) => (
							<AvatarNameCard
								key={`user-${user.id}`}
								name={user.pseudo}
								variant="user"
								avatarUrl={user.avatarUrl}
								selected={selectedMemberIds.has(user.id)}
								onClick={() => toggleMemberSelect(user.id)}
							/>
						))}
					</div>
					<button
						type="button"
						disabled={selectedMemberIds.size === 0}
						onClick={handleConfirmAddMembers}
						className="w-full bg-blue-500 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition mt-1">
						Confirmer l'ajout ({selectedMemberIds.size})
					</button>
				</>
			)}
		</div>
	)
}

export default AddMembersForm
