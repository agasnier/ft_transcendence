import { useState } from 'react'
import BackButton from '../ui/BackButton'
import type { SidebarView } from '../Sidebar'

interface UserMenuViewProps {
	setView: (view: SidebarView) => void
	onLogout: () => void
	pseudo: string | null
}

function UserMenuView({ setView, onLogout, pseudo }: UserMenuViewProps) {
	const [statusMsg, setStatusMsg] = useState<string | null>(null)

	async function handleCreateKey() {
		try {
			const res = await fetch('/api/api_keys/', { method: 'POST' })
			if (res.ok) {
				setStatusMsg('Clé API créée !')
			} else {
				setStatusMsg('Erreur création clé')
			}
		} catch {
			setStatusMsg('Erreur réseau')
		}
		setTimeout(() => setStatusMsg(null), 3000)
	}

	async function handleDeleteKey() {
		try {
			const res = await fetch('/api/api_keys/', { method: 'DELETE' })
			if (res.ok) {
				setStatusMsg('Clé API supprimée !')
			} else {
				setStatusMsg('Erreur suppression clé')
			}
		} catch {
			setStatusMsg('Erreur réseau')
		}
		setTimeout(() => setStatusMsg(null), 3000)
	}

	return (
		<>
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="text-xl font-bold">Paramètres</h2>
			</div>
			<div className="flex flex-col items-center gap-2 font-semibold text-gray-800 py-2">
				<span
					className="avatar-circle bg-blue-500 w-16 h-16 text-2xl">
					{pseudo?.charAt(0).toUpperCase() ?? '?'}
				</span>
				<span className="truncate">{pseudo ?? 'Utilisateur'}</span>
			</div>
			<p className="border-t text-gray-200 my-1"></p>
			<h3 className="font-semibold text-gray-700 mt-2">Clé API</h3>
			<button
				onClick={handleCreateKey}
				className="menu-item text-blue-600 hover:bg-blue-50">
				Créer clé API
			</button>
			<button
				onClick={handleDeleteKey}
				className="menu-item text-amber-600 hover:bg-amber-50">
				Supprimer clé API
			</button>
			{statusMsg && (
				<p className="text-xs text-center font-medium text-emerald-600 py-1">{statusMsg}</p>
			)}
			<p className="border-t text-gray-200 my-1"></p>
			<h3 className="font-semibold text-gray-700 mt-2">Double auth</h3>
			<p className="border-t text-gray-200 my-1"></p>
			<button
				onClick={onLogout}
				className="menu-item text-red-600">
				Déconnexion
			</button>
		</>
	)
}

export default UserMenuView
