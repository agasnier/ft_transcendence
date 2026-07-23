import { useState } from 'react'
import TextField from './TextField'
import AuthCard from './AuthCard'

interface LoginFormProps {
	onSwitchToSignup: () => void
	onShowPrivacy: () => void
	onShowTerms: () => void
	onLoginSuccess: () => Promise<void>
	signupSuccess?: boolean
}

function LoginForm({ onSwitchToSignup, onShowPrivacy, onShowTerms, onLoginSuccess, signupSuccess }: LoginFormProps) {
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

		if (res.ok)
			await onLoginSuccess()
		else {
			const body = await res.json()
			setPassword('')
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
			{signupSuccess && !error && (<p className="text-green-600 text-sm text-center">Compte créé, vous pouvez vous connecter</p>)}
			{error && (<p className="text-red-600 text-sm text-center">{error}</p>)}

			<button
				type="submit"
				className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 hover:scale-105 transition">
				Se connecter
			</button>

			<button
				type="button"
				onClick={onSwitchToSignup}
				className="text-blue-600 hover:underline hover:scale-105 text-sm">
				pas de compte ? S'inscrire
			</button>
	</AuthCard>
	)
}

export default LoginForm
