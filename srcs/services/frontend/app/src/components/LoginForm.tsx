import { useState, useEffect } from 'react'
import TextField from './TextField'
import AuthCard from './AuthCard'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

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

    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })

    if (res.ok)
      await checkSession()
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

  if (isLoggedIn) {
    return (
      <AuthCard title="Connexion" onSubmit={handleSubmit}>
        <button
          type="button"
          onClick={handleCreateKey}
          className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition-colors">
          Créer clé API</button>
        <button
          type="button"
          onClick={handleDeleteKey}
          className="bg-yellow-500 text-white rounded-md py-2 hover:bg-yellow-600 transition-colors">
          Supprimer clé API</button>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-600 text-white rounded-md py-2 hover:bg-red-700 transition-colors">
          Déconnexion</button>
      </AuthCard>
    )
  }

  return (
  <AuthCard title="Connexion" onSubmit={handleSubmit}>

      <TextField
        id="login-login"
        type="text"
        placeholder="Mail ou Pseudo"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        required
      />

      <TextField
        id="login-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
        Se connecter</button>

      <button
        type="button"
        onClick={onSwitchToSignup}
        className="text-blue-600 hover:underline text-sm">
        pas de compte ? S'inscrire
      </button>
  </AuthCard>
  )
}

export default LoginForm
