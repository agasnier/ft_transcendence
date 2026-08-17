import { useState } from 'react'
import type { SidebarView } from '../Sidebar'
import BackButton from '../ui/BackButton'
import AvatarNameCard from '../ui/AvatarNameCard'
import CreateRoomForm from '../ui/CreateRoomForm'
import { useFriends } from '../../../hooks/useFriends'

interface CreateGroupViewProps {
	setView: (view: SidebarView) => void
	userId: number | null
	onCreateChannel: (type: 'group', memberIds: number[], name?: string, description?: string) => Promise<{ id: number } | null>
}

interface SelectedUser {
	id: number
	pseudo: string
}

function CreateGroupView({ setView, userId, onCreateChannel }: CreateGroupViewProps) {
	const friends = useFriends()
	const [step, setStep] = useState< 'pick' | 'form' >('pick')
	const [error, setError] = useState<string | null>(null)
	const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([])
	const [pseudoInput, setPseudoInput] = useState('')
	const [searchError, setSearchError] = useState<string | null>(null)

	function toggleFriend(friend: SelectedUser) {
		setSelectedUsers((prev) =>
			prev.some((u) => u.id === friend.id)
				? prev.filter((u) => u.id !== friend.id)
				: [...prev, friend]
		)
	}

	function removeUser(id: number) {
		setSelectedUsers((prev) => prev.filter((u) => u.id !== id))
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

		const allUsers: { id: number; pseudo: string }[] = await res.json()
		const target = allUsers.find((u) => u.pseudo === pseudo)
		if (!target) {
			setSearchError('Utilisateur introuvable')
			return
		}
		if (target.id === userId) {
			setSearchError('Vous êtes déjà membre du groupe')
			return
		}
		if (selectedUsers.some((u) => u.id === target.id)) {
			setSearchError('Déjà ajouté')
			return			
		}

		setSelectedUsers((prev) => [...prev, target])
		setPseudoInput('')
		setSearchError(null)
	}

	if (step === 'form')
	{
		return (
			<div className="flex flex-col gap-2 h-full min-h-0">
				<div className="flex items-center gap-2">
					<BackButton onClick={() => setView({ kind: 'home' })} />
					<h2 className="view-title">Nouveau groupe</h2>
				</div>
				<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
					<CreateRoomForm
						type="group"
						onCancel={() => setView({kind: 'home'})}
						onCreate={async (name, description) => {
							if (userId === null) return
							const channel = await onCreateChannel('group', [userId, ...selectedUsers.map((u) => u.id)], name, description)
							if (channel) setView({kind: 'home'})
							else setError('Impossible de créer le groupe')
						}}
					/>
					{error && <p className="form-error">{error}</p>}
				</div>
			</div>
		)
	}
	return (
		<div className="flex flex-col gap-2 h-full min-h-0">
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="view-title">Ajouter des membres</h2>
			</div>
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
					placeholder="Rechercher"
					maxLength={255}
					className="peer min-w-0 flex-1 border border-gray-300 rounded-3xl px-3 py-2 hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
				/>
				<button
					type="button"
					onClick={handleAddByPseudo}
					className="text-xs bg-user text-white rounded-full px-3 hover:bg-blue-600">
					Ajouter
				</button>
			</div>
			{searchError && <p className="text-sm text-danger">{searchError}</p>}
			{selectedUsers.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{selectedUsers.map((u) => (
						<button
							key={u.id}
							type="button"
							onClick={() => removeUser(u.id)}
							title="Retirer"
							className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-100 rounded-full hover:bg-danger-bg">
							<span className="text-danger font-bold">x</span>
							<span>{u.pseudo}</span>
						</button>
					))}
				</div>
			)}
			<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
				<h2 className="text-2xl font-bold">Amis</h2>
				{friends.map((friend) => (
					<AvatarNameCard
						key={`friend-${friend.id}`}
						name={friend.pseudo}
						variant="user"
						selected={selectedUsers.some((u) => u.id === friend.id)}
						onClick={() => toggleFriend(friend)}
					/>
				))}
			</div>
			<div data-create-room-popover className="relative self-end">
				<button
					type="button"
					onClick={() => setStep('form')}
					title="Créer un groupe"
					className="fab-button">
					➡︎
				</button>
			</div>
		</div>
	)
}

export default CreateGroupView
