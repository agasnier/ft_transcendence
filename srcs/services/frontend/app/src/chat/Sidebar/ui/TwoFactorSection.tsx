import { useEffect, useState } from 'react'
import { IconCheck, IconCopy } from '../../../icons'
import QRCode from 'qrcode'

function TwoFactorSection() {
	const [statusMsg, setStatusMsg] = useState<string | null>(null)
	const [secret, setSecret] = useState<string | null>(null)
	const [qrSrc, setQrSrc] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const [enabled, setEnabled] = useState(false)
	const [confirmEnable, setConfirmEnable] = useState(false)
	const [isEnabling, setIsEnabling] = useState(false)
	const [confirmDisable, setConfirmDisable] = useState(false)
	const [disableCode, setDisableCode] = useState('')
	const [isDisabling, setIsDisabling] = useState(false)

	useEffect(() => {
		async function loadStatus() {
			try {
				const res = await fetch('/auth/2fa/status')
				if (!res.ok) {
					setEnabled(false)
					return
				}
				const body = await res.json()
				setEnabled(body.enabled === true)
			} catch {
				setEnabled(false)
			}
		}
		loadStatus()
	}, [])

	async function handleEnable() {
		if (isEnabling) return
		setIsEnabling(true)
		try {
			const setupRes = await fetch('/auth/2fa/setup', { method: 'POST' })
			if (!setupRes.ok) {
				setSecret(null)
				setQrSrc(null)
				setStatusMsg('Erreur activation 2FA')
				setTimeout(() => setStatusMsg(null), 3000)
				return
			}
			const body = await setupRes.json()
			const enableRes = await fetch('/auth/2fa/enable', { method: 'POST' })
			if (enableRes.ok) {
				setSecret(body.secret ?? null)
				setQrSrc(body.otpauthUrl
					? await QRCode.toDataURL(body.otpauthUrl, { width: 160, margin: 1 })
					: null)
				setEnabled(true)
				setConfirmEnable(false)
				setCopied(false)
				setStatusMsg(body.secret ? null : '2FA activée !')
			} else {
				setSecret(null)
				setQrSrc(null)
				setStatusMsg('Erreur activation 2FA')
				setTimeout(() => setStatusMsg(null), 3000)
			}
		} catch {
			setSecret(null)
			setQrSrc(null)
			setStatusMsg('Erreur réseau')
			setTimeout(() => setStatusMsg(null), 3000)
		} finally {
			setIsEnabling(false)
		}
	}

	async function handleCopySecret() {
		if (!secret) return
		try {
			await navigator.clipboard.writeText(secret)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			setStatusMsg('Impossible de copier')
			setTimeout(() => setStatusMsg(null), 2000)
		}
	}

	async function handleDisable() {
		if (isDisabling || disableCode.length !== 6) return
		setIsDisabling(true)
		try {
			const res = await fetch('/auth/2fa/disable', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ code: disableCode }),
			})
			if (res.ok) {
				setSecret(null)
				setQrSrc(null)
				setEnabled(false)
				setCopied(false)
				setConfirmDisable(false)
				setDisableCode('')
				setStatusMsg('2FA désactivée !')
			} else {
				setDisableCode('')
				setStatusMsg(res.status === 401 ? 'Code 2FA invalide' : 'Erreur désactivation 2FA')
			}
		} catch {
			setStatusMsg('Erreur réseau')
		}
		setIsDisabling(false)
		setTimeout(() => setStatusMsg(null), 3000)
	}

	return (
		<>
			<h3 className="font-semibold text-gray-700 mt-2">Double auth</h3>
			{!enabled && !confirmEnable && (
				<button
					type="button"
					onClick={() => setConfirmEnable(true)}
					className="menu-item text-blue-600 hover:bg-blue-50">
					Activer 2FA
				</button>
			)}
			{!enabled && confirmEnable && (
				<div className="flex flex-col gap-2 px-2 py-1">
					<p className="text-xs text-amber-700 leading-snug">
						Ce code ne s'affichera qu'une seule fois. En cas de problème, contactez le support :
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
							onClick={handleEnable}
							disabled={isEnabling}
							className="text-sm px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
							{isEnabling ? '...' : 'Confirmer'}
						</button>
						<button
							type="button"
							onClick={() => setConfirmEnable(false)}
							disabled={isEnabling}
							className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50">
							Annuler
						</button>
					</div>
				</div>
			)}
			{enabled && !confirmDisable && (
				<button
					type="button"
					onClick={() => {
						setConfirmDisable(true)
						setDisableCode('')
						setStatusMsg(null)
					}}
					className="menu-item text-amber-600 hover:bg-amber-50">
					Désactiver 2FA
				</button>
			)}
			{enabled && confirmDisable && (
				<form
					className="flex flex-col gap-2 px-2 py-1"
					onSubmit={(e) => {
						e.preventDefault()
						void handleDisable()
					}}>
					<p className="text-xs text-amber-700 leading-snug">
						Entrez le code de votre application d'authentification pour confirmer la désactivation.
					</p>
					<input
						type="text"
						inputMode="numeric"
						autoComplete="one-time-code"
						maxLength={6}
						value={disableCode}
						onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
						placeholder="Code à 6 chiffres"
						autoFocus
						className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-center tracking-widest"
					/>
					<div className="flex justify-center gap-2">
						<button
							type="submit"
							disabled={isDisabling || disableCode.length !== 6}
							className="text-sm px-3 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
							{isDisabling ? '...' : 'Confirmer'}
						</button>
						<button
							type="button"
							onClick={() => {
								setConfirmDisable(false)
								setDisableCode('')
							}}
							disabled={isDisabling}
							className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50">
							Annuler
						</button>
					</div>
				</form>
			)}
			{qrSrc && (
				<img src={qrSrc} alt="QR code 2FA" className="mx-auto my-2 w-40 h-40" />
			)}
			{secret && (
				<div className="flex items-center gap-1 px-2 py-1">
					<p className="text-xs font-medium text-emerald-600 break-all flex-1 min-w-0 leading-7">{secret}</p>
					<button
						type="button"
						onClick={handleCopySecret}
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

export default TwoFactorSection
