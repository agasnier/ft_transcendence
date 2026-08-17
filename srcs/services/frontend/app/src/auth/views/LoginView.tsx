import { useState } from 'react'
import TextField from '../../components/TextField'
import AuthCard from '../ui/AuthCard'
import type { AuthView } from '../Auth'

interface LoginViewProps {
	setView: (view: AuthView) => void
	onLoginSuccess: () => Promise<void>
}

function LoginView({ setView, onLoginSuccess }: LoginViewProps) {
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)


	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null);

		const res = await fetch('/auth/login', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ login, password }),
		})

		if (res.ok) {
			const body = await res.json()
			if (body.requires2FA)
				setView({ kind: 'twoFactor' })
			else
				await onLoginSuccess()
		}
		else {
			const body = await res.json()
			setPassword('')
			setError(body.message)
		}
	}

	const privacyPolicy = (
		<button
			type="button"
			onClick={() => setView({ kind: 'privacy', from: 'login' })}
			className="text-black hover:underline text-xs">
			Politique de confidentialité
		</button>
	)

	const termsOfService = (
		<button
			type="button"
			onClick={() => setView({ kind: 'terms', from: 'login' })}
			className="text-black hover:underline text-xs">
			Conditions d'utilisation
		</button>
	)

	return (
	<AuthCard title="Connexion" onSubmit={handleSubmit} privacyPolicy={privacyPolicy} termsOfService={termsOfService}>

			<TextField
				id="login-login"
				label="E-mail ou pseudo"
				type="text"
				value={login}
				onChange={(e) => setLogin(e.target.value)}
				required
				autoFocus
			/>

			<TextField
				id="login-password"
				label="Mot de passe"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>
			{error && (<p className="form-error">{error}</p>)}

			<button
				type="submit"
				className="btn-primary">
				Se connecter
			</button>

			<button
				type="button"
				onClick={() => setView({ kind: 'signup' })}
				className="text-blue-600 hover:underline hover:scale-105 text-sm">
				pas de compte ? S'inscrire
			</button>
	</AuthCard>
	)
}

export default LoginView
