import { useState, useEffect } from 'react'
import type { SidebarView } from '../Sidebar'
import BackButton from '../ui/BackButton'
import AvatarNameCard from '../ui/AvatarNameCard'
import CreateRoomForm from '../../CreateRoomForm'

interface CreateGroupViewProps {
	setView: (view: SidebarView) => void
	userId: number | null
	onCreateChannel: (type: 'group', memberIds: number[], name?: string, description?: string) => void
}

interface UserRow {
	id: number
	pseudo: string
}

function CreateGroupView({ setView, userId, onCreateChannel }: CreateGroupViewProps) {
	const [friends, setFriends] = useState<UserRow[]>([])
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [step, setStep] = useState< 'pick' | 'form' >('pick')

	useEffect(() => {
		async function load() {
			const [friendsRes] = await Promise.all([
				fetch('/friends'),
				fetch('/users'),
			])
			if (friendsRes.ok) {
				const data = await friendsRes.json()
				setFriends(data.map((friend: { id: number; pseudo: string }) => ({ id: friend.id, pseudo: friend.pseudo })))
			}
		}
		load()
	}, [])

	function toggleMember(id: number) {
		setSelectedIds(prev => {
			const next = new Set(prev)
			next.has(id) ? next.delete(id) : next.add(id)
			return next
		})
	}

	if (step === 'form')
	{
		return (
			<>
				<div className="flex items-center gap-2">
					<BackButton onClick={() => setView({ kind: 'home' })} />
					<h2 className="text-xl font-bold">Nouveau groupe</h2>
				</div>
				<CreateRoomForm
					type="group"
					onCancel={() => setView({kind: 'home'})}
					onCreate={(name, description) => {
						if (userId === null) return
						onCreateChannel('group', [userId, ...selectedIds], name, description)
						setView({kind: 'home'})
					}}
				/>
			</>
		)
	}
	return (
		<>
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="text-xl font-bold">Ajouter des membres</h2>
			</div>
			{friends.map((friend) => (
				<AvatarNameCard
					key={`friend-${friend.id}`}
					name={friend.pseudo}
					selected={selectedIds.has(friend.id)}
					onClick={() => toggleMember(friend.id)}
				/>
			))}
			<div data-create-room-popover
			className="relative mt-auto self-end">
			<button
				type="button"
				onClick={() => setStep('form')}
				title="Créer un groupe"
				className="mt-auto self-end bg-blue-500 text-white font-bold w-13 h-13 rounded-full hover:bg-blue-600 flex items-center justify-center text-4xl">
				➡︎
			</button>
			</div>
		</>
	)
}

export default CreateGroupView
