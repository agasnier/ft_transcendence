import { useState } from 'react'
import TextField from '../../../components/TextField'

function PasswordSection() {
	const [isEditing, setIsEditing] = useState(false)
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [statusMsg, setStatusMsg] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	function resetForm() {
		setCurrentPassword('')
		setNewPassword('')
		setConfirmPassword('')
		setError(null)
	}

	function cancelEditing() {
		resetForm()
		setIsEditing(false)
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (isSaving) return

		if (newPassword.length < 8) {
			setError('Le mot de passe doit contenir au moins 8 caractères')
			return
		}
		if (newPassword !== confirmPassword) {
			setError('Les mots de passe ne correspondent pas')
			setNewPassword('')
			setConfirmPassword('')
			return
		}

		setIsSaving(true)
		setError(null)
		try {
			const res = await fetch('/auth/password', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword }),
			})
			if (res.ok) {
				resetForm()
				setIsEditing(false)
				setStatusMsg('Mot de passe modifié !')
			} else {
				setCurrentPassword('')
				setError(res.status === 401 ? 'Mot de passe actuel incorrect' : 'Erreur modification mot de passe')
			}
		} catch {
			setError('Erreur réseau')
		} finally {
			setIsSaving(false)
			setTimeout(() => setStatusMsg(null), 3000)
		}
	}

	return (
		<>
			<h3 className="font-semibold text-gray-700 mt-2">Mot de passe</h3>
			{!isEditing && (
				<button
					type="button"
					onClick={() => {
						resetForm()
						setIsEditing(true)
						setStatusMsg(null)
					}}
					className="menu-item text-blue-600 hover:bg-blue-50">
					Changer le mot de passe
				</button>
			)}
			{isEditing && (
				<form className="flex flex-col gap-2 px-2 py-1" onSubmit={handleSubmit}>
					<TextField
						id="current-password"
						label="Mot de passe actuel"
						type="password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						required
						autoFocus
						autoComplete="current-password"
					/>
					<TextField
						id="new-password"
						label="Nouveau mot de passe"
						type="password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
						autoComplete="new-password"
					/>
					<TextField
						id="confirm-new-password"
						label="Confirmer le mot de passe"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						autoComplete="new-password"
					/>
					{error && (
						<p className="text-xs text-center font-medium text-red-600">{error}</p>
					)}
					<div className="flex justify-center gap-2">
						<button
							type="submit"
							disabled={isSaving}
							className="text-sm px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
							{isSaving ? '...' : 'Confirmer'}
						</button>
						<button
							type="button"
							onClick={cancelEditing}
							disabled={isSaving}
							className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50">
							Annuler
						</button>
					</div>
				</form>
			)}
			{statusMsg && (
				<p className="text-xs text-center font-medium text-emerald-600 py-1">{statusMsg}</p>
			)}
		</>
	)
}

export default PasswordSection
