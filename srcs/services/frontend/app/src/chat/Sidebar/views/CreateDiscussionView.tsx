import { useState, useEffect } from 'react'
import type { SidebarView } from '../Sidebar'
import BackButton from '../ui/BackButton'
import AvatarNameCard from '../ui/AvatarNameCard'
import { useFriends } from '../../../hooks/useFriends'
import { useUserAvatars } from '../../../hooks/presence'

interface CreateDiscussionViewProps {
	setView: (view: SidebarView) => void
	userId: number | null
	onCreateChannel: (type: 'discussion', memberIds: number[], name?: string, description?: string) => Promise<{ id: number } | null>
	onSelectChannel: (id: number) => void
}

interface UserRow {
	id: number
	pseudo: string
	avatarUrl?: string | null
}

function CreateDiscussionView({ setView, userId, onCreateChannel, onSelectChannel }: CreateDiscussionViewProps) {
	const friends = useFriends()
	const userAvatars = useUserAvatars()
	const [others, setOthers] = useState<UserRow[]>([])
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadOther() {
			const res = await fetch('/users')
			if (res.ok) {
				const data = await res.json()
				setOthers(data
					.filter((user: { id: number; pseudo: string }) => user.id !== userId)
					.map((user: { id: number; pseudo: string }) => ({ id: user.id, pseudo: user.pseudo }))
				)
			}
		}
		loadOther()
	}, [userId])

	async function handleSelect(user: UserRow) {
		if (userId === null)
			return
		const channel = await onCreateChannel('discussion', [userId, user.id])
		if (channel) {
			setView({ kind: 'home' })
			onSelectChannel(channel.id)
		}
		else
			setError('Impossible de démarrer la discussion')
	}

	return (
		<div className="flex flex-col gap-2 h-full min-h-0">
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="view-title">Nouvelle discussion</h2>
			</div>
			<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
				<h3 className="font-semibold text-gray-700 mt-2">Amis</h3>
				{friends.map((friend) => (
					<AvatarNameCard
						key={`friend-${friend.id}`}
						name={userAvatars.get(friend.id)?.pseudo ?? friend.pseudo}
						variant="user"
						avatarUrl={userAvatars.get(friend.id)?.avatarUrl !== undefined
							? userAvatars.get(friend.id)?.avatarUrl
							: friend.avatarUrl}
						onClick={() => handleSelect(friend)}
					/>
				))}

				<h3 className="font-semibold text-gray-700 mt-4">Autres</h3>
				{others.map((user) => (
					<AvatarNameCard
						key={`other-${user.id}`}
						name={userAvatars.get(user.id)?.pseudo ?? user.pseudo}
						variant="user"
						onClick={() => handleSelect(user)}
					/>
				))}
				{error && <p className="form-error">{error}</p>}
			</div>
		</div>
	)
}

export default CreateDiscussionView
