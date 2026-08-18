import { useState } from 'react'
import TextField from '../../components/TextField'
import AuthCard from '../ui/AuthCard'
import type { AuthView } from '../Auth'

interface SignupViewProps {
	setView: (view: AuthView) => void
	onSignupSuccess: () => void
}

function SignupView({ setView, onSignupSuccess }: SignupViewProps) {
	const [mail, setMail] = useState('')
	const [pseudo, setPseudo] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null);

		if (password !== confirmPassword) {
			setError('Les mots de passe ne correspondent pas')
			setPassword('')
			setConfirmPassword('')
			return
		}
		const res = await fetch('/auth/register', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ mail, pseudo, password }),
		})

		if (res.ok)
			onSignupSuccess()
		else {
			setError('Impossible de créer le compte')
		}
	}

	const privacyPolicy = (
		<button
			type="button"
			onClick={() => setView({ kind: 'privacy', from: 'signup' })}
			className="text-black hover:underline text-xs">
			Politique de confidentialité
		</button>
	)

	const termsOfService = (
		<button
			type="button"
			onClick={() => setView({ kind: 'terms', from: 'signup' })}
			className="text-black hover:underline text-xs">
			Conditions d'utilisation
		</button>
	)

	return (
		<AuthCard title="Inscription" onSubmit={handleSubmit} privacyPolicy={privacyPolicy} termsOfService={termsOfService}>

			<TextField
				id="signup-email"
				label="Adresse e-mail"
				type="email"
				value={mail}
				onChange={(e) => setMail(e.target.value)}
				required
				autoFocus
				autoComplete="email"
			/>

			<TextField
				id="signup-pseudo"
				label="Pseudo"
				type="text"
				value={pseudo}
				onChange={(e) => setPseudo(e.target.value)}
				required
				autoComplete="username"
			/>

			<TextField
				id="signup-password"
				label="Mot de passe: 8 caractères min."
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
				autoComplete="new-password"
			/>

			<TextField
				id="confirm-password"
				label="Confirmer le mot de passe"
				type="password"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				required
				autoComplete="new-password"
			/>

			{error && (<p className="form-error">{error}</p>)}

			<button
				type="submit"
				className="btn-primary">
				S'inscrire
			</button>

			<button
				type="button"
				onClick={() => setView({ kind: 'login' })}
				className="text-blue-600 hover:underline hover:scale-105 text-sm">
				déjà un compte ? Se connecter
			</button>

		</AuthCard>
	)
}

export default SignupView
