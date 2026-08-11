import { useState } from 'react'
import { useClickOutside } from '../../../hooks/useClickOutside'

interface UserMenuProps {
	onLogout: () => void
	pseudo: string | null
}

function UserMenu({onLogout, pseudo}: UserMenuProps) {
	const [menuOpen, setMenuOpen] = useState(false)
	const [statusMsg, setStatusMsg] = useState<string | null>(null)

	useClickOutside(menuOpen, '[data-user-menu-popover]', () => setMenuOpen(false))

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
		<div data-user-menu-popover className="relative">
			<button
				onClick={() => setMenuOpen((open) => !open)}
				className="icon-button w-12 h-12  text-4xl"
				title="Menu utilisateur">
				≡
			</button>
			{menuOpen && (
				<div className="absolute z-20 top-full left-0 mt-2 w-56 drop-shadow-[0_1px_8px_rgba(0,0,0,0.15)] border rounded-2xl bg-white overflow-hidden gap-2 p-1">
					<button
						className="menu-item flex gap-2 font-semibold text-gray-800">
						<span
							className="avatar-circle bg-blue-500 w-6 h-6 text-sm">
							{pseudo?.charAt(0).toUpperCase() ?? '?'}
						</span>
						<span className="truncate">{pseudo ?? 'Utilisateur'}</span>
					</button>
					<p className="border-t text-gray-200 my-1"></p>
					<button className="menu-item">
						Paramètres
					</button>
					<p className="border-t text-gray-200 my-1"></p>
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
					<button
						onClick={onLogout}
						className="menu-item text-red-600">
						Déconnexion
					</button>
				</div>
			)}
		</div>
	)
}

export default UserMenu

