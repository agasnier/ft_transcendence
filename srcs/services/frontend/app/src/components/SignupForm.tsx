import { useState } from 'react'
import TextField from './TextField'
import AuthCard from './AuthCard'

interface SignupFormProps {
	onSwitchToLogin: () => void
	onSignupSuccess: () => void
	onShowPrivacy: () => void
	onShowTerms: () => void
}

function SignupForm({ onSwitchToLogin, onSignupSuccess, onShowPrivacy, onShowTerms }: SignupFormProps) {
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
			const body = await res.json()
			setError(body.message)
		}
	}

	const privacyPolicy = (
		<button
			type="button"
			onClick={onShowPrivacy}
			className="text-black hover:underline text-xs">
			Politique de confidentialité
		</button>
	)

	const termsOfService = (
		<button
			type="button"
			onClick={onShowTerms}
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
			/>

			<TextField
				id="signup-pseudo"
				label="Pseudo"
				type="text"
				value={pseudo}
				onChange={(e) => setPseudo(e.target.value)}
				required
			/>

			<TextField
				id="signup-password"
				label="Mot de passe: 8 caractères min."
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>

			<TextField
				id="confirm-password"
				label="Confirmer le mot de passe"
				type="password"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				required
			/>

			{error && (<p className="text-red-600 text-sm text-center">{error}</p>)}

			<button
				type="submit"
				className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 hover:scale-105 transition">
				S'inscrire
			</button>

			<button
				type="button"
				onClick={onSwitchToLogin}
				className="text-blue-600 hover:underline hover:scale-105 text-sm">
				déjà un compte ? Se connecter
			</button>

		</AuthCard>
	)
}

export default SignupForm
