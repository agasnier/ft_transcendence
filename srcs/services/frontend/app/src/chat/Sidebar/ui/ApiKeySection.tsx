import { useEffect, useState } from 'react'
import { IconRenew, IconCheck, IconCopy } from '../../../icons'

function ApiKeySection() {
	const [statusMsg, setStatusMsg] = useState<string | null>(null)
	const [createdKey, setCreatedKey] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const [hasKey, setHasKey] = useState(false)
	const [expiresAt, setExpiresAt] = useState<string | null>(null)
	const [confirmCreate, setConfirmCreate] = useState(false)
	const [confirmRenew, setConfirmRenew] = useState(false)
	const [isCreating, setIsCreating] = useState(false)
	const [isRenewing, setIsRenewing] = useState(false)

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
				setHasKey(body.hasKey === true)
				setExpiresAt(body.expires_at ?? null)
			} catch {
				setHasKey(false)
				setExpiresAt(null)
			}
		}
		loadKey()
	}, [])

	async function handleCreateKey() {
		if (isCreating) return
		setIsCreating(true)
		try {
			const res = await fetch('/api/api_keys/', { method: 'POST' })
			if (res.ok) {
				const body = await res.json()
				setCreatedKey(body.apiKeyCreated ?? null)
				setHasKey(true)
				setExpiresAt(body.expires_at ?? null)
				setConfirmCreate(false)
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
		} finally {
			setIsCreating(false)
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
		if (isRenewing) return
		setIsRenewing(true)
		try {
			const res = await fetch('/api/api_keys/', { method: 'PUT' })
			if (res.ok) {
				const body = await res.json()
				setCreatedKey(body.apiKeyCreated ?? null)
				setHasKey(true)
				setExpiresAt(body.expires_at ?? null)
				setConfirmRenew(false)
				setCopied(false)
				setStatusMsg(body.apiKeyCreated ? null : 'Clé API renouvelée !')
			} else {
				setStatusMsg('Erreur renouvellement clé')
				setTimeout(() => setStatusMsg(null), 3000)
			}
		} catch {
			setStatusMsg('Erreur réseau')
			setTimeout(() => setStatusMsg(null), 3000)
		} finally {
			setIsRenewing(false)
		}
	}

	async function handleDeleteKey() {
		try {
			const res = await fetch('/api/api_keys/', { method: 'DELETE' })
			if (res.ok) {
				setCreatedKey(null)
				setHasKey(false)
				setExpiresAt(null)
				setConfirmRenew(false)
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
			<h3 className="font-semibold text-gray-700 mt-2">Clé API</h3>
			{!hasKey && !confirmCreate && (
				<button
					type="button"
					onClick={() => setConfirmCreate(true)}
					className="menu-item text-blue-600 hover:bg-blue-50">
					Créer clé API
				</button>
			)}
			{!hasKey && confirmCreate && (
				<div className="flex flex-col gap-2 px-2 py-1">
					<p className="text-xs text-amber-700 leading-snug">
						Cette clé ne s'affichera qu'une seule fois. En cas de problème, contactez le support :
						{' '}
						<a
							href="mailto:support.transcendence@gmail.com"
							className="underline break-all">
							support.transcendence@gmail.com
						</a>
					</p>
					<div className="flex justify-center gap-2">
						<button
							type="button"
							onClick={handleCreateKey}
							disabled={isCreating}
							className="text-sm px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
							{isCreating ? '...' : 'Confirmer'}
						</button>
						<button
							type="button"
							onClick={() => setConfirmCreate(false)}
							disabled={isCreating}
							className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50">
							Annuler
						</button>
					</div>
				</div>
			)}
			{hasKey && (
				<>
					<div className="flex items-center gap-2">
						<p className="menu-item text-amber-600 hover:bg-amber-50">
							{expiresAt
								? `Expire le ${new Date(expiresAt).toLocaleDateString('fr-FR')}`
								: 'Expire le —'}
						</p>
						{!confirmRenew && (
							<button
								type="button"
								onClick={() => setConfirmRenew(true)}
								className="icon-button w-12 h-10 text-gray-500"
								title="Renouveler">
								<IconRenew size={18}/>
							</button>
						)}
					</div>
					{confirmRenew && (
						<div className="flex flex-col gap-2 px-2 py-1">
							<p className="text-xs text-amber-700 leading-snug">
								Cette clé ne s'affichera qu'une seule fois. En cas de problème, contactez le support :
								{' '}
								<a
									href="mailto:support.transcendence@gmail.com"
									className="underline break-all">
									support.transcendence@gmail.com
								</a>
							</p>
							<div className="flex justify-center gap-2">
								<button
									type="button"
									onClick={handleRenewKey}
									disabled={isRenewing}
									className="text-sm px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
									{isRenewing ? '...' : 'Confirmer'}
								</button>
								<button
									type="button"
									onClick={() => setConfirmRenew(false)}
									disabled={isRenewing}
									className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50">
									Annuler
								</button>
							</div>
						</div>
					)}
					<button
						type="button"
						onClick={handleDeleteKey}
						className="menu-item text-amber-600 hover:bg-amber-50">
						Supprimer clé API
					</button>
				</>
			)}
			{createdKey && (
				<div className="flex items-center gap-1 px-2 py-1">
					<p className="text-xs font-medium text-emerald-600 break-all flex-1 min-w-0 leading-7">{createdKey}</p>
					<button
						type="button"
						onClick={handleCopyKey}
						className="icon-button w-7 h-7 shrink-0 text-blue-600"
						title={copied ? 'Copiée' : 'Copier'}>
						{copied ? <IconCheck size={16}/> : <IconCopy size={16}/>}
					</button>
				</div>
			)}
			{statusMsg && (
				<p className="text-xs text-center font-medium text-emerald-600 py-1">{statusMsg}</p>
			)}
		</>
	)
}

export default ApiKeySection
