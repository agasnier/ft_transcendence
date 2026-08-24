import { useState, useEffect } from 'react'

interface UserRow {
	id: number
	pseudo: string
	avatarUrl: string | null
}

export function useFriends() {
	const [friends, setFriends] = useState<UserRow[]>([])

	useEffect(() => {
		async function load() {
			const res = await fetch('/friends')
			if (res.ok) {
				const data = await res.json()
				setFriends(data.map((friend: { id: number; pseudo: string; avatarUrl: string | null }) => ({
					id: friend.id,
					pseudo: friend.pseudo,
					avatarUrl: friend.avatarUrl,
				})))
			}
		}
		load()
	}, [])
	return friends
}