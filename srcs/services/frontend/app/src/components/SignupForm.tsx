import { useState } from 'react'

function SignupForm() {
  const [mail, setMail] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await fetch('/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mail, pseudo, password }),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inscription</h2>
      <input
        id="signup-mail"
        type="text"
        placeholder="Mail"
        value={mail}
        onChange={(e) => setMail(e.target.value)}
        required
      />
      <input
        id="signup-pseudo"
        type="text"
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
        required
      />
      <input
        id="signup-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">S'inscrire</button>
    </form>
  )
}

export default SignupForm

