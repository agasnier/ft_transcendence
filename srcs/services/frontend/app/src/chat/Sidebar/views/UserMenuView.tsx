import { useState, useEffect } from 'react'
import BackButton from '../ui/BackButton'
import ApiKeySection from '../ui/ApiKeySection'
import TwoFactorSection from '../ui/TwoFactorSection'
import type { SidebarView } from '../Sidebar'

interface UserMenuViewProps {
	setView: (view: SidebarView) => void
	onLogout: () => void
	pseudo: string | null
}

interface Profile {
	bio: string | null
}

function UserMenuView({ setView, onLogout, pseudo }: UserMenuViewProps) {
	const [profile, setProfile] = useState<Profile | null>(null)

	useEffect(() => {
		async function fetchProfile() {
			const res = await fetch('/users/profile')
			if (res.ok) {
				setProfile(await res.json())
			} else {
            console.error('Failed to fetch profile:', res.status, await res.text())
       		}
		}
		fetchProfile()
	}, [])

	return (
		<>
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="text-xl font-bold">Paramètres</h2>
			</div>
			<div className="flex flex-col items-center gap-2 font-semibold text-gray-800 py-2">
				<span
					className="avatar-circle bg-blue-500 w-30 h-30 text-6xl">
					{pseudo?.charAt(0).toUpperCase() ?? '?'}
				</span>
				<span className="truncate text-2xl">{pseudo ?? 'Utilisateur'}</span>
				<div className="w-full px-4">
					<p className="text-sm text-gray-500 text-center bg-gray-50 rounded-xl px-3 py-2 min-h-[2.5rem]">
						{profile?.bio || <span className="text-gray-300 italic">Aucune bio</span>}
					</p>
				</div>
			</div>
			<p className="border-t text-gray-200 my-1"></p>
			<ApiKeySection />
			<p className="border-t text-gray-200 my-1"></p>
			<TwoFactorSection />
			<p className="border-t text-gray-200 my-1"></p>
			<button
				onClick={onLogout}
				className="menu-item text-red-600 hover:bg-red-100">
				Déconnexion
			</button>
		</>
	)
}

export default UserMenuView
