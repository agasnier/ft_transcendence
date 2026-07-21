import { useState, useEffect } from 'react'
import TextField from './TextField'
import AuthCard from './AuthCard'

interface LoginFormProps {
	onSwitchToSignup: () => void
	onShowPrivacy: () => void
	onShowTerms: () => void
}

function LoginForm({ onSwitchToSignup, onShowPrivacy, onShowTerms }: LoginFormProps) {
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [userId, setUserId] = useState<number | null>(null)
	const [error, setError] = useState<string | null>(null)

	async function checkSession() {
		const res = await fetch('/auth/session')
		if (res.ok) {
			const user = await res.json()
			setUserId(user.id)
			setIsLoggedIn(true)
		}
	}

	useEffect(() => {
		checkSession()
	}, [])

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null);

		const res = await fetch('/auth/login', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ login, password }),
		})

		if (res.ok)
			await checkSession()
		else {
			const body = await res.json()
			setPassword('')
			setError(body.message)
		}
	}

	async function handleLogout() {
		await fetch('/auth/logout', { method: 'POST' })
		setIsLoggedIn(false)
		setUserId(null)
	}

	async function handleCreateKey() {
		if (userId === null)
			return

		await fetch('/api/api_keys/', { method: 'POST' })
	}

	async function handleDeleteKey() {
		if (userId === null)
			return

		await fetch('/api/api_keys/', { method: 'DELETE' })
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

	if (isLoggedIn) {
		return (
			<AuthCard title="Connexion" onSubmit={handleSubmit} privacyPolicy={privacyPolicy} termsOfService={termsOfService}>
				<button
					type="button"
					onClick={handleCreateKey}
					className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition-colors">
					Créer clé API
				</button>
				<button
					type="button"
					onClick={handleDeleteKey}
					className="bg-yellow-500 text-white rounded-md py-2 hover:bg-yellow-600 transition-colors">
					Supprimer clé API
				</button>
				<button
					type="button"
					onClick={handleLogout}
					className="bg-red-600 text-white rounded-md py-2 hover:bg-red-700 transition-colors">
					Déconnexion
				</button>
			</AuthCard>
		)
	}

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
