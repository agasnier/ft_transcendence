import { useState } from 'react'
import SignupForm from './components/SignupForm'
import LoginForm from './components/LoginForm'
import PrivacyForm from './components/PrivacyForm'
import TermsForm from './components/TermsForm'

function App() {
	const [view, setView] = useState<'login' | 'signup' | 'privacy' | 'terms'>('login')

	if (view === 'login')
		return <LoginForm
			onSwitchToSignup={() => setView('signup')}
			onShowPrivacy={() => setView('privacy')}
			onShowTerms={() => setView('terms')}
		/>
	else if (view === 'signup')
		return <SignupForm
			onSwitchToLogin={() => setView('login')}
			onShowPrivacy={() => setView('privacy')}
			onShowTerms={() => setView('terms')}
		/>
	else if (view === 'privacy')
		return <PrivacyForm onBack={() => setView('login')} />
	else if (view === 'terms')
		return <TermsForm onBack={() => setView('login')} />
}

export default App
