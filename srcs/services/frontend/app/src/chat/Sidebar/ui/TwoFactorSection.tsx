import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

function TwoFactorSection() {
	const [statusMsg, setStatusMsg] = useState<string | null>(null)
	const [secret, setSecret] = useState<string | null>(null)
	const [qrSrc, setQrSrc] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const [enabled, setEnabled] = useState(false)

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
		try {
			const res = await fetch('/auth/2fa/disable', { method: 'POST' })
			if (res.ok) {
				setSecret(null)
				setQrSrc(null)
				setEnabled(false)
				setCopied(false)
				setStatusMsg('2FA désactivée !')
			} else {
				setStatusMsg('Erreur désactivation 2FA')
			}
		} catch {
			setStatusMsg('Erreur réseau')
		}
		setTimeout(() => setStatusMsg(null), 3000)
	}

	return (
		<>
			<h3 className="font-semibold text-gray-700 mt-2">Double auth</h3>
			{!enabled && (
				<button
					onClick={handleEnable}
					className="menu-item text-blue-600 hover:bg-blue-50">
					Activer 2FA
				</button>
			)}
			{enabled && (
				<button
					onClick={handleDisable}
					className="menu-item text-amber-600 hover:bg-amber-50">
					Désactiver 2FA
				</button>
			)}
			{qrSrc && (
				<img src={qrSrc} alt="QR code 2FA" className="mx-auto my-2 w-40 h-40" />
			)}
			{secret && (
				<div className="flex items-start gap-2 px-2 py-1">
					<p className="text-xs font-medium text-emerald-600 break-all flex-1 min-w-0">{secret}</p>
					<button
						type="button"
						onClick={handleCopySecret}
						className="menu-item w-auto shrink-0 text-blue-600 hover:bg-blue-50"
						title={copied ? 'Copiée' : 'Copier'}>
						{copied ? '✓' : '⎘'}
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
