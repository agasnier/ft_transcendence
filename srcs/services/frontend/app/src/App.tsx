import { useState, useEffect } from 'react'
import Auth from './auth/Auth'
import Chat from './chat/Chat'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const [userId, setUserId] = useState<number | null>(null)
    const [pseudo, setPseudo] = useState<string | null>(null)
    const [role, setRole] = useState<'admin' | 'user' | null>(null)

    async function checkSession() {
        const res = await fetch('/auth/session')
        if (res.ok) {
            const user = await res.json()
            if (user.authenticated) {
                setUserId(user.id)
                setPseudo(user.pseudo)
                setRole(user.role)
                setIsLoggedIn(true)
                setIsCheckingSession(false)
                return
            }
        }
        setIsLoggedIn(false)
        setUserId(null)
        setPseudo(null)
        setRole(null)
        setIsCheckingSession(false)
    }

    useEffect(() => {
        checkSession()
    }, [])

    useEffect(() => {
        function handleAuthLost() {
            setIsLoggedIn(false)
            setUserId(null)
            setPseudo(null)
            setRole(null)
        }
        window.addEventListener('auth-lost', handleAuthLost)
        return () => window.removeEventListener('auth-lost', handleAuthLost)
    }, [])

    async function handleLogout() {
        await fetch('/auth/logout', { method: 'POST' })
        setIsLoggedIn(false)
        setUserId(null)
        setRole(null)
    }

    async function handleUpdatePseudo(newPseudo: string): Promise<boolean> {
        if (userId === null) return false
        const res = await fetch(`/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pseudo: newPseudo }),
        })
        if (res.ok) {
            setPseudo(newPseudo)
            return true
        }
        return false
    }

    if (isCheckingSession)
        return null

    if (!isLoggedIn)
        return <Auth onAuthSuccess={checkSession} />

    return <Chat onLogout={handleLogout} pseudo={pseudo} userId={userId} role={role} onUpdatePseudo={handleUpdatePseudo} />
}

export default App