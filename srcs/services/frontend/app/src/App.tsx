import { useState, useEffect, useRef } from 'react'
import SignupForm from './components/SignupForm'
import LoginForm from './components/LoginForm'
import LegalPage from './components/LegalPage'
import { privacyContent, termsContent } from './content/LegalContent'
import Chat from './chat/Chat'

type View = 'login' | 'signup' | 'privacy' | 'terms'

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [isCheckingSession, setIsCheckingSession] = useState(true)
	const [userId, setUserId] = useState<number | null>(null)
	const [pseudo, setPseudo] = useState<string | null>(null)
	const [view, setView] = useState<View>('login')
	const prevView = useRef<View>('login')

	async function checkSession() {
		const res = await fetch('/auth/session')
		if (res.ok) {
			const user = await res.json()
			setUserId(user.id)
			setPseudo(user.pseudo)
			setIsLoggedIn(true)
		}
		setIsCheckingSession(false)
	}

	useEffect(() => {
		checkSession()
	}, [])

	async function handleLogout() {
		await fetch('/auth/logout', { method: 'POST' })
		setIsLoggedIn(false)
		setUserId(null)
	}

	if (isCheckingSession)
		return null // TODO add skeleton

	if (!isLoggedIn) {
		if (view === 'login')
			return <LoginForm
				onSwitchToSignup={() => { setView('signup') }}
				onShowPrivacy={() => { prevView.current = 'login'; setView('privacy') }}
				onShowTerms={() => { prevView.current = 'login'; setView('terms') }}
				onLoginSuccess={checkSession}
			/>
		else if (view === 'signup')
			return <SignupForm
				onSwitchToLogin={() => setView('login')}
				onSignupSuccess={() => { checkSession() }}
				onShowPrivacy={() => { prevView.current = 'signup'; setView('privacy') }}
				onShowTerms={() => { prevView.current = 'signup'; setView('terms') }}
			/>
		else if (view === 'privacy')
			return <LegalPage content={privacyContent} onBack={() => setView(prevView.current)} />
		else if (view === 'terms')
			return <LegalPage content={termsContent} onBack={() => setView(prevView.current)} />
	}
	else {
		return <Chat onLogout={handleLogout} pseudo={pseudo} userId={userId}/>
	}
}

export default App
