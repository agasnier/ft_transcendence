import { useState, useEffect } from 'react'
import UserMenu from './UserMenu'

interface SidebarProp {
	onLogout: () => void
	onSwitchToContacts: () => void
	pseudo: string | null
}

interface Friend {
	id: number
	pseudo: string
	avatarUrl: string | null
	isOnline: boolean | null
}

function Sidebar({onLogout, onSwitchToContacts, pseudo}: SidebarProp) {
	const [friends, setFriends] = useState<Friend[]>([])

	useEffect(() => {
		async function loadFriends() {
			const res = await fetch('/friends')
			if (res.ok)
				setFriends(await res.json())
		}
		loadFriends()
		const intervalId = setInterval(loadFriends, 5000)
		return () => clearInterval(intervalId)
	}, [])

	return (
		<aside className="w-80 shrink-0 shadow-2xl rounded-3xl bg-white flex flex-col overflow-y-auto gap-2 p-2">
			<div
				className="flex items-center justify-between">
				<UserMenu onLogout={onLogout} onSwitchToContacts={onSwitchToContacts} pseudo={pseudo}/>
			</div>
			<div className="bg-gray-100 rounded-3xl p-4">
				<h2 className="font-semibold text-gray-700 mb-2">Amis</h2>
				{friends.length === 0 ? (
					<p className="text-sm text-gray-400">Aucun ami</p>
				) : (
					<ul className="flex flex-col gap-1">
						{friends.map((friend) => (
							<li key={friend.id} className="flex items-center gap-2 px-2 py-1 rounded-2xl hover:bg-gray-200">
								<span className="relative">
									<span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
										{friend.pseudo?.charAt(0).toUpperCase() ?? '?'}
									</span>
									<span
										className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-100 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
									/>
								</span>
								<span className="text-sm text-gray-700">{friend.pseudo}</span>
							</li>
						))}
					</ul>
				)}
			</div>
			<div className="bg-gray-100 rounded-3xl p-4">
				<h2 className="font-semibold text-gray-700 mb-2">Conversations</h2>
				<p className="text-sm text-gray-400">Aucune conversation</p>
			</div>
			<button
				className="mt-auto self-end bg-blue-500 text-white font-bold w-12 h-12 rounded-full hover:bg-blue-600 flex items-center justify-center text-2xl"title="Créer un salon">
				+
			</button>
		</aside>
	)
}

export default Sidebar
