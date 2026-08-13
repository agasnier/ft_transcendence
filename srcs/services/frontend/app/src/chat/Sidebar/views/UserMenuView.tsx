import { useEffect, useState } from 'react'
import BackButton from '../ui/BackButton'
import type { SidebarView } from '../Sidebar'

interface UserMenuViewProps {
	setView: (view: SidebarView) => void
	onLogout: () => void
	pseudo: string | null
}

function UserMenuView({ setView, onLogout, pseudo }: UserMenuViewProps) {
	const [statusMsg, setStatusMsg] = useState<string | null>(null)
	const [createdKey, setCreatedKey] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const [hasKey, setHasKey] = useState(false)
	const [expiresAt, setExpiresAt] = useState<string | null>(null)

	useEffect(() => {
		async function loadKey() {
			try {
				const res = await fetch('/api/api_keys/')
				if (!res.ok) {
					setHasKey(false)
					setExpiresAt(null)
					return
				}
				const body = await res.json()
				setHasKey(true)
				setExpiresAt(body.expires_at ?? null)
			} catch {
				setHasKey(false)
				setExpiresAt(null)
			}
		}
		loadKey()
	}, [])

	async function handleCreateKey() {
		try {
			const res = await fetch('/api/api_keys/', { method: 'POST' })
			if (res.ok) {
				const body = await res.json()
				setCreatedKey(body.apiKeyCreated ?? null)
				setHasKey(true)
				setExpiresAt(body.expires_at ?? null)
				setCopied(false)
				setStatusMsg(body.apiKeyCreated ? null : 'Clé API créée !')
			} else {
				setCreatedKey(null)
				setStatusMsg('Erreur création clé')
				setTimeout(() => setStatusMsg(null), 3000)
			}
		} catch {
			setCreatedKey(null)
			setStatusMsg('Erreur réseau')
			setTimeout(() => setStatusMsg(null), 3000)
		}
	}

	async function handleCopyKey() {
		if (!createdKey) return
		try {
			await navigator.clipboard.writeText(createdKey)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			setStatusMsg('Impossible de copier')
			setTimeout(() => setStatusMsg(null), 2000)
		}
	}

	async function handleRenewKey() {
		try {
			const res = await fetch('/api/api_keys/', { method: 'PUT' })
			if (res.ok) {
				const body = await res.json()
				setCreatedKey(body.apiKeyCreated ?? null)
				setHasKey(true)
				setExpiresAt(body.expires_at ?? null)
				setCopied(false)
				setStatusMsg(body.apiKeyCreated ? null : 'Clé API renouvelée !')
			} else {
				setStatusMsg('Erreur renouvellement clé')
				setTimeout(() => setStatusMsg(null), 3000)
			}
		} catch {
			setStatusMsg('Erreur réseau')
			setTimeout(() => setStatusMsg(null), 3000)
		}
	}

	async function handleDeleteKey() {
		try {
			const res = await fetch('/api/api_keys/', { method: 'DELETE' })
			if (res.ok) {
				setCreatedKey(null)
				setHasKey(false)
				setExpiresAt(null)
				setCopied(false)
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
			{!hasKey && (
				<button
					onClick={handleCreateKey}
					className="menu-item text-blue-600 hover:bg-blue-50">
					Créer clé API
				</button>
			)}
			{hasKey && (
				<>
					<div className="flex items-center gap-2">
						<p className="menu-item text-amber-600 hover:bg-amber-50">
							{expiresAt
								? `Expire le ${new Date(expiresAt).toLocaleDateString('fr-FR')}`
								: 'Expire le —'}
						</p>
						<button
							type="button"
							onClick={handleRenewKey}
							className="icon-button w-12 h-12 text-2xl text-gray-500 leading-none"
							title="Renouveler">
							⟲
						</button>
					</div>
					<button
						onClick={handleDeleteKey}
						className="menu-item text-amber-600 hover:bg-amber-50">
						Supprimer clé API
					</button>
				</>
			)}
			{createdKey && (
				<div className="flex items-start gap-2 px-2 py-1">
					<p className="text-xs font-medium text-emerald-600 break-all flex-1 min-w-0">{createdKey}</p>
					<button
						type="button"
						onClick={handleCopyKey}
						className="menu-item w-auto shrink-0 text-blue-600 hover:bg-blue-50"
						title={copied ? 'Copiée' : 'Copier'}>
						{copied ? '✓' : '⎘'}
					</button>
				</div>
			)}
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
