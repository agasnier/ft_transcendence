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
	const [isEditingBio, setIsEditingBio] = useState(false)
	const [bioDraft, setBioDraft] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		async function fetchProfile() {
			const res = await fetch('/users/profile')
			if (res.ok) {
				const data = await res.json()
				setProfile(data)
				setBioDraft(data.bio ?? '')
			}
		}
		fetchProfile()
	}, [])

	function startEditingBio() {
        setBioDraft(profile?.bio ?? '')
        setIsEditingBio(true)
    }

    async function saveBio() {
        setIsSaving(true)
        const res = await fetch('/users/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio: bioDraft }),
        })
        if (res.ok) {
            const updated = await res.json()
            setProfile(updated)
            setIsEditingBio(false)
        }
        setIsSaving(false)
    }

    function cancelEditingBio() {
        setBioDraft(profile?.bio ?? '')
        setIsEditingBio(false)
    }

	return (
        <div className="flex flex-col gap-2 h-full min-h-0">
            <div className="flex items-center gap-2">
                <BackButton onClick={() => setView({ kind: 'home' })} />
                <h2 className="text-xl font-bold">Paramètres</h2>
            </div>
			<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
	            <div className="flex flex-col items-center gap-2 font-semibold text-gray-800 py-2">
	                <span
	                    className="avatar-circle bg-blue-500 w-30 h-30 text-6xl">
	                    {pseudo?.charAt(0).toUpperCase() ?? '?'}
	                </span>
	                <span className="truncate text-2xl">{pseudo ?? 'Utilisateur'}</span>

                <div className="w-full px-4">
                    {isEditingBio ? (
                        <div className="flex flex-col gap-2">
                            <textarea
                                value={bioDraft}
                                onChange={(e) => setBioDraft(e.target.value)}
                                maxLength={500}
                                rows={3}
                                className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 resize-none font-normal"
                                placeholder="Parle un peu de toi..."
                            />
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={saveBio}
                                    disabled={isSaving}
                                    className="text-sm px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">
                                    {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                                </button>
                                <button
                                    onClick={cancelEditingBio}
                                    disabled={isSaving}
                                    className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm text-gray-500 text-center bg-gray-50 rounded-xl px-3 py-2 min-h-[2.5rem] w-full font-normal">
                                {profile?.bio || <span className="text-gray-300 italic">Aucune bio</span>}
                            </p>
                            <button
                                onClick={startEditingBio}
                                className="text-xs text-blue-500 hover:underline">
                                Modifier la bio
                            </button>
                        </div>
                    )}
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
			</div>
        </div>
    )
}

export default UserMenuView
