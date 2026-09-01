import { useState, useEffect } from 'react'
import { IconEdit, IconDelete } from '../../../icons'
import { MAX_NAME_LENGTH } from '../../../limits'

interface AdminUser {
    id: number
    pseudo: string
    mail: string
    role: 'admin' | 'user'
}

interface AdminPanelProps {
    currentUserId: number | null
}

function AdminPanel({ currentUserId }: AdminPanelProps) {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [pseudoDraft, setPseudoDraft] = useState('')
    const [roleDraft, setRoleDraft] = useState<'admin' | 'user'>('user')
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function loadUsers() {
        const res = await fetch('/users')
        if (res.ok)
            setUsers(await res.json())
    }

    useEffect(() => {
        loadUsers()
    }, [])

    function startEditing(user: AdminUser) {
        setEditingId(user.id)
        setPseudoDraft(user.pseudo)
        setRoleDraft(user.role)
        setError(null)
    }

    function cancelEditing() {
        setEditingId(null)
        setError(null)
    }

    async function saveUser(id: number) {
        const isSelf = id === currentUserId
        const body: { pseudo?: string; role?: 'admin' | 'user' } = { pseudo: pseudoDraft }
        if (!isSelf) body.role = roleDraft

        const res = await fetch(`/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        if (res.ok) {
            await loadUsers()
            setEditingId(null)
        } else {
            const err = await res.json().catch(() => null)
            setError(err?.message ?? 'Échec de la mise à jour')
        }
    }

    async function deleteUser(id: number) {
        const res = await fetch(`/users/${id}`, { method: 'DELETE' })
        if (res.ok) {
            await loadUsers()
            setConfirmDeleteId(null)
        }
    }

    return (
        <div className="bg-gray-100 rounded-3xl p-4 flex flex-col gap-2">
            <h2 className="font-semibold text-gray-700 mb-2">Administration ({users.length})</h2>
            {users.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun utilisateur</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {users.map((user) => (
                        <li key={user.id} className="bg-white rounded-2xl p-3 flex flex-col gap-2">
                            {editingId === user.id ? (
                                <div className="flex flex-col gap-2">
                                    <input
                                        value={pseudoDraft}
                                        onChange={(e) => setPseudoDraft(e.target.value)}
                                        maxLength={MAX_NAME_LENGTH}
                                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                    />
                                    {user.id !== currentUserId && (
                                        <select
                                            value={roleDraft}
                                            onChange={(e) => setRoleDraft(e.target.value as 'admin' | 'user')}
                                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    )}
                                    {error && <p className="text-xs text-red-600">{error}</p>}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => saveUser(user.id)}
                                            className="text-xs px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                                            Enregistrer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="text-xs px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-sm truncate">
                                            {user.pseudo} {user.id === currentUserId && <span className="text-xs text-gray-400">(vous)</span>}
                                        </span>
                                        <span className="text-xs text-gray-500 truncate">{user.mail}</span>
                                        <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(user)}
                                            title="Modifier"
                                            className="icon-button w-8 h-8 hover:bg-gray-200">
                                            <IconEdit size={16} className="icon-hover-grow"/>
                                        </button>
                                        {user.id !== currentUserId && (
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDeleteId(user.id === confirmDeleteId ? null : user.id)}
                                                title="Supprimer"
                                                className="icon-button w-8 h-8 hover:bg-red-100">
                                                <IconDelete size={16} className="icon-hover-grow"/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            {confirmDeleteId === user.id && (
                                <div className="flex items-center justify-between bg-red-50 rounded-xl p-2">
                                    <span className="text-xs text-red-700">Supprimer définitivement {user.pseudo} ?</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => deleteUser(user.id)}
                                            className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600">
                                            Confirmer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="text-xs px-2 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default AdminPanel