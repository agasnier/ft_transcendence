import { useState, useEffect } from 'react'
import SignupForm from './components/SignupForm'
import LoginForm from './components/LoginForm'
import PrivacyForm from './components/PrivacyForm'
import TermsForm from './components/TermsForm'
import MainApp from './MainApp'

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [, setUserId] = useState<number | null>(null)
	const [pseudo, setPseudo] = useState<string | null>(null)
	const [view, setView] = useState<'login' | 'signup' | 'privacy' | 'terms'>('login')
	const [signupSuccess, setSignupSuccess] = useState(false)

	async function checkSession() {
		const res = await fetch('/auth/session')
		if (res.ok) {
			const user = await res.json()
			setUserId(user.id)
			setPseudo(user.pseudo)
			setIsLoggedIn(true)
		}
	}

	useEffect(() => {
		checkSession()
	}, [])

	async function handleLogout() {
		await fetch('/auth/logout', { method: 'POST' })
		setIsLoggedIn(false)
		setUserId(null)
	}

	if (!isLoggedIn) {
		if (view === 'login')
			return <LoginForm
				onSwitchToSignup={() => { setSignupSuccess(false); setView('signup') }}
				onShowPrivacy={() => setView('privacy')}
				onShowTerms={() => setView('terms')}
				onLoginSuccess={checkSession}
				signupSuccess={signupSuccess}
			/>
		else if (view === 'signup')
			return <SignupForm
				onSwitchToLogin={() => setView('login')}
				onSignupSuccess={() => { setSignupSuccess(true); setView('login') }}
				onShowPrivacy={() => setView('privacy')}
				onShowTerms={() => setView('terms')}
			/>
		else if (view === 'privacy')
			return <PrivacyForm onBack={() => setView('login')} />
		else if (view === 'terms')
			return <TermsForm onBack={() => setView('login')} />
	}
	else {
		return <MainApp onLogout={handleLogout} pseudo={pseudo}/>
	}
}

export default App
