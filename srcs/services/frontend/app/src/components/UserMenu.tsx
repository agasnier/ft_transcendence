import { useState, useEffect, useRef } from 'react'

interface UserMenuProps {
	onLogout: () => void
	pseudo: string | null
}

function UserMenu({onLogout, pseudo}: UserMenuProps) {
	const [menuOpen, setMenuOpen] = useState(false)
	const [statusMsg, setStatusMsg] = useState<string | null>(null)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!menuOpen)
			return

		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node))
				setMenuOpen(false)
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [menuOpen])

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
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setMenuOpen((open) => !open)}
				className="w-12 h-12 flex items-center justify-center text-4xl hover:bg-gray-100 rounded-full"
				title="Menu utilisateur">
				≡
			</button>
			{menuOpen && (
				<div className="absolute z-20 top-full left-0 mt-2 w-56 drop-shadow-[0_1px_8px_rgba(0,0,0,0.15)] border rounded-2xl bg-white overflow-hidden gap-2 p-1">
					<button
						className="w-full flex text-left gap-2 px-4 py-2 hover:bg-gray-100 rounded-2xl font-semibold text-gray-800">
						<span
							className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
							{pseudo?.charAt(0).toUpperCase() ?? '?'}
						</span>
						<span className="truncate">{pseudo ?? 'Utilisateur'}</span>
					</button>
					<p className="border-t text-gray-200 my-1"></p>
					<button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-2xl text-sm">
						Paramètres
					</button>
					<p className="border-t text-gray-200 my-1"></p>
					<button
						onClick={handleCreateKey}
						className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors">
						Créer clé API
					</button>
					<button
						onClick={handleDeleteKey}
						className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-2xl transition-colors">
						Supprimer clé API
					</button>

					{statusMsg && (
						<p className="text-xs text-center font-medium text-emerald-600 py-1">{statusMsg}</p>
					)}

					<p className="border-t text-gray-200 my-1"></p>
					<button
						onClick={onLogout}
						className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 rounded-2xl transition-colors">
						Déconnexion
					</button>
				</div>
			)}
		</div>
	)
}

export default UserMenu

