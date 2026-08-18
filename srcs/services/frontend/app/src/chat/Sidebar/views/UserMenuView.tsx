import { useState, useEffect } from 'react'
import BackButton from '../ui/BackButton'
import ApiKeySection from '../ui/ApiKeySection'
import TwoFactorSection from '../ui/TwoFactorSection'
import PasswordSection from '../ui/PasswordSection'
import TextField from '../../../components/TextField'
import TextAreaField from '../../../components/TextAreaField'
import type { SidebarView } from '../Sidebar'

interface UserMenuViewProps {
    setView: (view: SidebarView) => void
    onLogout: () => void
    pseudo: string | null
    onUpdatePseudo: (newPseudo: string) => Promise<boolean>
}

interface Profile {
    bio: string | null
}

function UserMenuView({ setView, onLogout, pseudo, onUpdatePseudo }: UserMenuViewProps) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isEditingBio, setIsEditingBio] = useState(false)
    const [bioDraft, setBioDraft] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const [isEditingPseudo, setIsEditingPseudo] = useState(false)
    const [pseudoDraft, setPseudoDraft] = useState('')
    const [isSavingPseudo, setIsSavingPseudo] = useState(false)
    const [pseudoError, setPseudoError] = useState<string | null>(null)

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

    function startEditingPseudo() {
        setPseudoDraft(pseudo ?? '')
        setPseudoError(null)
        setIsEditingPseudo(true)
    }

    async function savePseudo() {
        const trimmed = pseudoDraft.trim()
        if (trimmed === '') {
            setPseudoError('Le pseudo ne peut pas être vide')
            return
        }
        setIsSavingPseudo(true)
        setPseudoError(null)
        const ok = await onUpdatePseudo(trimmed)
        if (ok) {
            setIsEditingPseudo(false)
        } else {
            setPseudoError('Ce pseudo est peut-être déjà pris')
        }
        setIsSavingPseudo(false)
    }

    function cancelEditingPseudo() {
        setPseudoDraft(pseudo ?? '')
        setPseudoError(null)
        setIsEditingPseudo(false)
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <BackButton onClick={() => setView({ kind: 'home' })} />
                <h2 className="view-title">Paramètres</h2>
            </div>
            <div className="flex flex-col items-center gap-2 font-semibold text-gray-800 py-2">
                <span
                    className="avatar-circle bg-user w-30 h-30 text-6xl">
                    {pseudo?.charAt(0).toUpperCase() ?? '?'}
                </span>

                {isEditingPseudo ? (
                    <div className="flex flex-col gap-2 w-full px-4">
                        <TextField
                            id="pseudo"
                            label="Pseudo"
                            type="text"
                            value={pseudoDraft}
                            onChange={(e) => setPseudoDraft(e.target.value)}
                            autoFocus
                        />
                        {pseudoError && <p className="text-xs text-red-600 text-center">{pseudoError}</p>}
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={savePseudo}
                                disabled={isSavingPseudo}
                                className="text-sm px-3 py-1 rounded-lg bg-user text-white hover:bg-blue-600 disabled:opacity-50">
                                {isSavingPseudo ? 'Sauvegarde...' : 'Enregistrer'}
                            </button>
                            <button
                                onClick={cancelEditingPseudo}
                                disabled={isSavingPseudo}
                                className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                                Annuler
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="truncate text-2xl">{pseudo ?? 'Utilisateur'}</span>
                        <button
                            onClick={startEditingPseudo}
                            title="Modifier le pseudo"
                            className="text-gray-400 hover:text-gray-700 text-sm">
                            🖋
                        </button>
                    </div>
                )}

                <div className="w-full px-4">
                    {isEditingBio ? (
                        <div className="flex flex-col gap-2">
                            <TextAreaField
                                id="bio"
                                label="Bio"
                                value={bioDraft}
                                onChange={(e) => setBioDraft(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={saveBio}
                                    disabled={isSaving}
                                    className="text-sm px-3 py-1 rounded-lg bg-user text-white hover:bg-blue-600 disabled:opacity-50">
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
                            <p className="text-sm text-gray-500 text-center bg-gray-50 rounded-xl px-3 py-2 min-h-[2.5rem] w-full font-normal whitespace-pre-line break-words">
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
            <PasswordSection />
            <p className="border-t text-gray-200 my-1"></p>
            <button
                onClick={onLogout}
                className="menu-item text-danger hover:bg-danger-bg">
                Déconnexion
            </button>
        </>
    )
}

export default UserMenuView