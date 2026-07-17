import { useState } from 'react'
import SignupForm from './components/SignupForm'
import LoginForm from './components/LoginForm'

function App() {
  const [view, setView] = useState<'login' | 'signup'>('login')

  if (view == 'login')
    return <LoginForm onSwitchToSignup={() => setView('signup')} />
  else
    return <SignupForm onSwitchToLogin={() => setView('login')} />
}

export default App
