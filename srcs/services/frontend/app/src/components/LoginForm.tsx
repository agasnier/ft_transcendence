import { useState, useEffect } from 'react'

function LoginForm() {
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
      <div>
        <h2>Connexion</h2>
        <button onClick={handleCreateKey}>Créer clé API</button>
        <button onClick={handleDeleteKey}>Supprimer clé API</button>
        <button onClick={handleLogout}>Déconnexion</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input
        id="login-login"
        type="text"
        placeholder="Mail ou Pseudo"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        required
      />
      <input
        id="login-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  )
}

export default LoginForm
