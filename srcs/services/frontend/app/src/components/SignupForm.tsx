import { useState } from 'react'
import TextField from './TextField'
import AuthCard from './AuthCard'

interface SignupFormProps {
	onSwitchToLogin: () => void
}

function SignupForm({ onSwitchToLogin }: SignupFormProps) {
	const [mail, setMail] = useState('')
	const [pseudo, setPseudo] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null);

		const res = await fetch('/auth/register', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ mail, pseudo, password }),
		})

		if (res.ok)
			onSwitchToLogin()
		else {
			const body = await res.json()
			setError(body.message)
		}
	}

	return (
		<AuthCard title="Inscription" onSubmit={handleSubmit}>

			<TextField
				id="signup-email"
				type="email"
				placeholder="Email: nom@example.com"
				value={mail}
				onChange={(e) => setMail(e.target.value)}
				required
			/>

			<TextField
				id="signup-pseudo"
				type="text"
				placeholder="Pseudo"
				value={pseudo}
				onChange={(e) => setPseudo(e.target.value)}
				required
			/>

			<TextField
				id="signup-password"
				type="password"
				placeholder="Mot de passe"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>

			{error && (<p className="text-red-600 text-sm text-center">{error}</p>)}

			<button
				type="submit"
				className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
				S'inscrire
			</button>

			<button
				type="button"
				onClick={onSwitchToLogin}
				className="text-blue-600 hover:underline text-sm">
				déjà un compte ? Se connecter
			</button>

		</AuthCard>
	)
}

export default SignupForm
