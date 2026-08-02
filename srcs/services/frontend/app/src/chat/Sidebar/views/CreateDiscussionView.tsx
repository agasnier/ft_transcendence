import { useEffect, useState } from 'react'
import type { SidebarView } from '../Sidebar'
import BackButton from '../ui/BackButton'
import AvatarNameCard from '../ui/AvatarNameCard'

interface CreateDiscussionViewProps {
	setView: (view: SidebarView) => void
	userId: number | null
	onCreateChannel: (type: 'discussion', memberIds: number[], name?: string, description?: string) => void
}

interface UserRow {
	id: number
	pseudo: string
}

function CreateDiscussionView({ setView, userId, onCreateChannel }: CreateDiscussionViewProps) {
	const [friends, setFriends] = useState<UserRow[]>([])
	const [others, setOthers] = useState<UserRow[]>([])

	useEffect(() => {
		async function load() {
			const [friendsRes, usersRes] = await Promise.all([
				fetch('/friends'),
				fetch('/users'),
			])
			if (friendsRes.ok) {
				const data = await friendsRes.json()
				setFriends(data.map((friend: { id: number; pseudo: string }) => ({ id: friend.id, pseudo: friend.pseudo })))
			}
			if (usersRes.ok) {
				const data = await usersRes.json()
				setOthers(data
					.filter((user: { id: number; pseudo: string }) => user.id !== userId)
					.map((user: { id: number; pseudo: string }) => ({ id: user.id, pseudo: user.pseudo })))
			}
		}
		load()
	}, [])

	function handleSelect(user: UserRow) {
		if (userId === null) return
		onCreateChannel('discussion', [userId, user.id])
		setView({ kind: 'home' })
	}

	return (
		<>
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="text-xl font-bold">Nouvelle discussion</h2>
			</div>

			<h3 className="font-semibold text-gray-700 mt-2">Amis</h3>
			{friends.map((friend) => (
				<AvatarNameCard
					key={`friend-${friend.id}`}
					name={friend.pseudo}
					onClick={() => handleSelect(friend)}
				/>
			))}

			<h3 className="font-semibold text-gray-700 mt-4">Autres</h3>
			{others.map((user) => (
				<AvatarNameCard
					key={`other-${user.id}`}
					name={user.pseudo}
					onClick={() => handleSelect(user)}
				/>
			))}
		</>
	)
}

export default CreateDiscussionView
