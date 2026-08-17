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

function CreateGroupView({ setView, userId, onCreateChannel }: CreateGroupViewProps) {
	const friends = useFriends()
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [step, setStep] = useState< 'pick' | 'form' >('pick')
	const [error, setError] = useState<string | null>(null)

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
			<div className="flex flex-col gap-2 h-full min-h-0">
				<div className="flex items-center gap-2">
					<BackButton onClick={() => setView({ kind: 'home' })} />
					<h2 className="text-xl font-bold">Nouveau groupe</h2>
				</div>
				<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
					<CreateRoomForm
						type="group"
						onCancel={() => setView({kind: 'home'})}
						onCreate={async (name, description) => {
							if (userId === null) return
							const channel = await onCreateChannel('group', [userId, ...selectedIds], name, description)
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
				<h2 className="text-xl font-bold">Ajouter des membres</h2>
			</div>
			<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
				{friends.map((friend) => (
					<AvatarNameCard
						key={`friend-${friend.id}`}
						name={friend.pseudo}
						variant="user"
						selected={selectedIds.has(friend.id)}
						onClick={() => toggleMember(friend.id)}
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
