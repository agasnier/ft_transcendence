import { useState } from 'react'
import TextField from '../../components/TextField'
import AuthCard from '../ui/AuthCard'
import type { AuthView } from '../Auth'

interface TwoFactorViewProps {
	setView: (view: AuthView) => void
	onVerifySuccess: () => Promise<void>
}

function TwoFactorView({ setView, onVerifySuccess }: TwoFactorViewProps) {
	const [code, setCode] = useState('')
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null);

		const res = await fetch('/auth/2fa/verify', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ code }),
		})

		if (res.ok)
			await onVerifySuccess()
		else {
			const body = await res.json()
			setCode('')
			setError(body.message)
		}
	}

	const privacyPolicy = (
		<button
			type="button"
			onClick={() => setView({ kind: 'privacy', from: 'twoFactor' })}
			className="text-black hover:underline text-xs">
			Politique de confidentialité
		</button>
	)

	const termsOfService = (
		<button
			type="button"
			onClick={() => setView({ kind: 'terms', from: 'twoFactor' })}
			className="text-black hover:underline text-xs">
			Conditions d'utilisation
		</button>
	)

	return (
	<AuthCard title="Vérification 2FA" onSubmit={handleSubmit} privacyPolicy={privacyPolicy} termsOfService={termsOfService}>

			<TextField
				id="twofa-code"
				label="Code à 6 chiffres"
				type="text"
				value={code}
				onChange={(e) => setCode(e.target.value)}
				required
				autoFocus
				autoComplete="one-time-code"
			/>
			{error && (<p className="form-error">{error}</p>)}

			<button
				type="submit"
				className="btn-primary">
				Valider
			</button>

			<button
				type="button"
				onClick={() => setView({ kind: 'login' })}
				className="text-blue-600 hover:underline hover:scale-105 text-sm">
				retour à la connexion
			</button>
	</AuthCard>
	)
}

export default TwoFactorView
