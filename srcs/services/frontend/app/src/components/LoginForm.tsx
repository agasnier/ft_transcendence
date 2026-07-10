import { useState, useEffect } from 'react'

function LoginForm() {
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const res = await fetch('/users/access')
      if (res.ok) {
        setIsLoggedIn(true)
        return
      }
    }

    checkSession()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const res = await fetch('/users/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pseudo, password }),
    })

    if (res.ok)
      setIsLoggedIn(true)
  }

  async function handleLogout() {
    await fetch('/users/logout', { method: 'POST' })
    setIsLoggedIn(false)
  }

  if (isLoggedIn) {
    return (
      <div>
        <h2>Connexion</h2>
        <button onClick={handleLogout}>Déconnexion</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input
        id="login-pseudo"
        type="text"
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
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
