import { useState } from 'react'
import LoginView from './views/LoginView'
import SignupView from './views/SignupView'
import TwoFactorView from './views/TwoFactorView'
import LegalView from './views/LegalView'
import { privacyContent, termsContent } from './content/LegalContent'

export type AuthView =
	| { kind: 'login' }
	| { kind: 'signup' }
	| { kind: 'twoFactor' }
	| { kind: 'privacy'; from: 'login' | 'signup' | 'twoFactor' }
	| { kind: 'terms'; from: 'login' | 'signup' | 'twoFactor' }

interface AuthProps {
	onAuthSuccess: () => Promise<void>
}

function Auth({ onAuthSuccess }: AuthProps) {
	const [view, setView] = useState<AuthView>({ kind: 'login' })

	function renderBody() {
		switch (view.kind) {
			case 'login':
				return (
					<LoginView
						setView={setView}
						onLoginSuccess={onAuthSuccess}
					/>
				)
			case 'signup':
				return (
					<SignupView
						setView={setView}
						onSignupSuccess={onAuthSuccess}
					/>
				)
			case 'twoFactor':
				return (
					<TwoFactorView
						setView={setView}
						onVerifySuccess={onAuthSuccess}
					/>
				)
			case 'privacy':
				return (
					<LegalView
						content={privacyContent}
						onBack={() => setView({ kind: view.from })}
					/>
				)
			case 'terms':
				return (
					<LegalView
						content={termsContent}
						onBack={() => setView({ kind: view.from })}
					/>
				)
		}
	}

	return renderBody()
}

export default Auth
