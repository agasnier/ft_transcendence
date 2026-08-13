import { useState, useEffect } from 'react'
import Auth from './auth/Auth'
import Chat from './chat/Chat'

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [isCheckingSession, setIsCheckingSession] = useState(true)
	const [userId, setUserId] = useState<number | null>(null)
	const [pseudo, setPseudo] = useState<string | null>(null)

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

	if (!isLoggedIn)
		return <Auth onAuthSuccess={checkSession} />

	return <Chat onLogout={handleLogout} pseudo={pseudo} userId={userId}/>
}

export default App
