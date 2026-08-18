import { useState, useEffect } from 'react'
import BackButton from "../Sidebar/ui/BackButton"
import AvatarNameCard from '../Sidebar/ui/AvatarNameCard'
import { useFriends } from '../../hooks/useFriends'

interface Member {
	userId: number
	role: 'moderator' | 'member'
	pseudo: string
	avatarUrl?: string | null
}

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
	otherUserId?: number
	writeMode?: 'everyone' | 'moderators_only'
}

interface PublicProfile {
	id: number
	displayName: string | null
	avatarUrl: string
	bio: string | null
	isOnline: boolean
	role: 'admin' | 'moderator' | 'user'
}

interface InfoPanelProps {
	channel: Channel
	userId: number | null
	onBack: () => void
	onDeleteChannel: (id: number) => void
	onRenameChannel: (id: number, name: string) => Promise<boolean>
	onUpdateDescription?: (id: number, description: string) => Promise<boolean>
	onAddMembers?: (channelId: number, memberIds: number[]) => Promise<boolean>
	onUpdateWriteMode?: (id: number, writeMode: 'everyone' | 'moderators_only') => Promise<boolean>
	onUpdateMemberRole?: (channelId: number, userId: number, role: 'moderator' | 'member') => Promise<boolean>
	onRemoveMember?: (channelId: number, userId: number) => Promise<boolean>
}

function InfoPanel({ channel, userId, onBack, onDeleteChannel, onRenameChannel, onUpdateDescription, onAddMembers, onUpdateWriteMode, onUpdateMemberRole, onRemoveMember }: InfoPanelProps) {
	const [isEditingName, setIsEditingName] = useState(false)
	const [nameInput, setNameInput] = useState(channel.name ?? '')
	const [isEditingDesc, setIsEditingDesc] = useState(false)
	const [descInput, setDescInput] = useState(channel.description ?? '')
	const [members, setMembers] = useState<Member[] | null>(null)
	const [otherProfile, setOtherProfile] = useState<PublicProfile | null>(null)
	const [isAddingMembers, setIsAddingMembers] = useState(false)
	const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set())
	const [pseudoInput, setPseudoInput] = useState('')
	const [searchError, setSearchError] = useState<string | null>(null)
	const [extraUsers, setExtraUsers] = useState<{ id: number; pseudo: string }[]>([])
	const [selectedMember, setSelectedMember] = useState<Member | null>(null)
	const [selectedMemberProfile, setSelectedMemberProfile] = useState<PublicProfile | null>(null)
	const [isSavingWriteMode, setIsSavingWriteMode] = useState(false)
	const [isSavingMemberRole, setIsSavingMemberRole] = useState(false)
	const [isRemovingMember, setIsRemovingMember] = useState(false)
	const [confirmRemove, setConfirmRemove] = useState(false)
	const [myRole, setMyRole] = useState<'admin' | 'moderator' | 'user' | null>(null)

	const isModerator = members?.some((m) => m.userId === userId && m.role === 'moderator') ?? false
	const friends = useFriends()

	async function loadMembers() {
		if (channel.type === 'discussion')
			return

		const res = await fetch(`/chat/channels/${channel.id}/members`)
		if (!res.ok)
			return
		const rows: { userId: number; role: 'moderator' | 'member' }[] = await res.json()
		if (rows.length === 0) {
			setMembers([])
			return
		}
		const usersRes = await fetch(`/users/batch?ids=${rows.map((r) => r.userId).join(',')}`)
		if (!usersRes.ok)
			return
		const users: { id: number; pseudo: string;  avatarUrl: string | null }[] = await usersRes.json()
		const infoById = new Map(users.map((u) => [u.id, u]))
		const pseudoById = new Map(users.map((u) => [u.id, u.pseudo]))
		const membersList: Member[] = rows.map((r) => ({ ...r, pseudo: pseudoById.get(r.userId) ?? '?', avatarUrl: infoById.get(r.userId)?.avatarUrl ?? null }))
		membersList.sort((a, b) => {
			if (a.role !== b.role)
				return a.role === 'moderator' ? -1 : 1
			return a.pseudo.localeCompare(b.pseudo)
		})
		setMembers(membersList)
	}

	useEffect(() => {
		loadMembers()
		setIsAddingMembers(false)
		setSelectedMemberIds(new Set())
		setExtraUsers([])
		setPseudoInput('')
		setSearchError(null)
		setSelectedMember(null)
		setSelectedMemberProfile(null)
	}, [channel.id, channel.type])

	useEffect(() => {
		setDescInput(channel.description ?? '')
		setNameInput(channel.name ?? '')
	}, [channel.id, channel.description, channel.name])

	useEffect(() => {
		if (channel.type !== 'discussion' || channel.otherUserId === undefined)
			return

		async function loadOtherProfile() {
			const res = await fetch(`/users/${channel.otherUserId}/profile`)
			if (res.ok)
				setOtherProfile(await res.json())
		}
		loadOtherProfile()
	}, [channel.type, channel.otherUserId])

	useEffect(() => {
		async function fetchMyRole() {
			const res = await fetch('/users/profile')
			if (res.ok) {
				const data = await res.json()
				setMyRole(data.role)
			}
		}
		fetchMyRole()
	}, [])

	async function handleSelectMember(member: Member) {
		setSelectedMember(member)
		setSelectedMemberProfile(null)
		const res = await fetch(`/users/${member.userId}/profile`)
		if (res.ok)
			setSelectedMemberProfile(await res.json())
	}

	async function handleRename(e: React.FormEvent) {
		e.preventDefault()
		if (!nameInput.trim())
			return
		const ok = await onRenameChannel(channel.id, nameInput.trim())
		if (ok)
			setIsEditingName(false)
	}

	async function handleUpdateDescription(e: React.FormEvent) {
		e.preventDefault()
		if (onUpdateDescription) {
			const ok = await onUpdateDescription(channel.id, descInput.trim())
			if (ok)
				setIsEditingDesc(false)
		}
	}

	function toggleMemberSelect(id: number) {
		setSelectedMemberIds((prev) => {
			const next = new Set(prev)
			next.has(id) ? next.delete(id) : next.add(id)
			return next
		})
	}

	async function handleAddByPseudo() {
		const pseudo = pseudoInput.trim()
		if (pseudo === '')
			return

		const res = await fetch('/users')
		if (!res.ok) {
			setSearchError('Impossible de contacter le serveur')
			return
		}

		const allUsers: { id: number; pseudo: string }[] = await res.json()
		const target = allUsers.find((u) => u.pseudo.toLowerCase() === pseudo.toLowerCase())
		if (!target) {
			setSearchError('Utilisateur introuvable')
			return
		}
		if (members?.some((m) => m.userId === target.id)) {
			setSearchError('Déjà membre du salon')
			return
		}
		if (selectedMemberIds.has(target.id)) {
			setSearchError('Déjà sélectionné')
			return			
		}

		setExtraUsers((prev) => prev.some((u) => u.id === target.id) ? prev : [...prev, target])
		setSelectedMemberIds((prev) => new Set([...prev, target.id]))
		setPseudoInput('')
		setSearchError(null)
	}

	async function handleConfirmAddMembers() {
		if (selectedMemberIds.size === 0 || !onAddMembers) return
		const ok = await onAddMembers(channel.id, Array.from(selectedMemberIds))
		if (ok) {
			setSelectedMemberIds(new Set())
			setExtraUsers([])
			setIsAddingMembers(false)
			await loadMembers()
		}
	}

	async function handleToggleWriteMode() {
		if (!onUpdateWriteMode) return
		const newMode = channel.writeMode === 'moderators_only' ? 'everyone' : 'moderators_only'
		setIsSavingWriteMode(true)
		await onUpdateWriteMode(channel.id, newMode)
		setIsSavingWriteMode(false)
	}

	async function handleToggleMemberRole() {
		if (!selectedMember || !onUpdateMemberRole) return
		const newRole = selectedMember.role === 'moderator' ? 'member' : 'moderator'
		setIsSavingMemberRole(true)
		const ok = await onUpdateMemberRole(channel.id, selectedMember.userId, newRole)
		if (ok) {
			setSelectedMember({ ...selectedMember, role: newRole })
			await loadMembers()
		}
		setIsSavingMemberRole(false)
	}

	async function handleRemoveMember() {
		if (!selectedMember || !onRemoveMember) return
		setIsRemovingMember(true)
		const ok = await onRemoveMember(channel.id, selectedMember.userId)
		setIsRemovingMember(false)
		if (ok) {
			setSelectedMember(null)
			await loadMembers()
		}
	}

	const existingMemberIds = new Set(members?.map((m) => m.userId) ?? [])
	const availableFriends = friends.filter((f) => !existingMemberIds.has(f.id))
	const selectableUsers = [
		...availableFriends,
		...extraUsers.filter((u) => !availableFriends.some((f) => f.id === u.id) && !existingMemberIds.has(u.id))
	]

	// Sub-panel: profile of a clicked member
	if (selectedMember) {
		return (
			<aside className="absolute top-0 right-0 h-full w-90 shadow-2xl rounded-3xl flex flex-col gap-2 p-4 bg-gray-100 z-10">
				<span className="flex items-center gap-2">
					<BackButton onClick={() => { setSelectedMember(null); setConfirmRemove(false) }} />
					<h2 className="view-title">Profil</h2>
				</span>
				<div className="flex flex-1 flex-col items-center gap-2 font-semibold text-gray-800 py-2 min-h-0">
					{selectedMemberProfile?.avatarUrl ? (
						<img
							src={selectedMemberProfile.avatarUrl}
							alt={selectedMember.pseudo}
							className="w-30 h-30 rounded-full object-cover"
						/>
					) : (
						<span className="avatar-circle bg-user w-30 h-30 text-6xl">
							{selectedMember.pseudo.charAt(0).toUpperCase()}
						</span>
					)}
					<h1 className="font-bold text-gray-800 text-lg truncate">{selectedMember.pseudo}</h1>
					{selectedMemberProfile?.isOnline !== undefined && (
						<span className={`text-sm ${selectedMemberProfile.isOnline ? 'text-green-500' : 'text-red-500'}`}>
							{selectedMemberProfile.isOnline ? 'En ligne' : 'Hors ligne'}
						</span>
					)}
					<span className="text-xs text-gray-500">
						{selectedMember.role === 'moderator' ? 'Modérateur' : 'Membre'}
					</span>
					{isModerator && selectedMember.userId !== userId && (myRole === 'admin' || selectedMemberProfile?.role !== 'admin') && onUpdateMemberRole && (
						<button
							type="button"
							onClick={handleToggleMemberRole}
							disabled={isSavingMemberRole}
							className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50">
							{isSavingMemberRole ? '...' : (selectedMember.role === 'moderator' ? 'Rétrograder' : 'Promouvoir modérateur')}
						</button>
					)}
					{selectedMemberProfile && (
						<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-2">
							<h2 className="font-bold">ⓘ bio</h2>
							<p className="whitespace-pre-line wrap-break-word">
								{selectedMemberProfile.bio || <span className="text-gray-300 italic">Aucune bio</span>}
							</p>
						</div>
					)}
					{isModerator && selectedMember.userId !== userId && (myRole === 'admin' || selectedMemberProfile?.role !== 'admin') && onRemoveMember && (
						<div className="w-full mt-2">
							{confirmRemove ? (
								<div className="flex flex-col gap-2">
									<p className="text-xs text-gray-600 text-center">Retirer {selectedMember.pseudo} du salon ?</p>
									<div className="flex justify-center gap-2">
										<button
											type="button"
											onClick={handleRemoveMember}
											disabled={isRemovingMember}
											className="text-sm px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
											{isRemovingMember ? '...' : 'Confirmer'}
										</button>
										<button
											type="button"
											onClick={() => setConfirmRemove(false)}
											disabled={isRemovingMember}
											className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
											Annuler
										</button>
									</div>
								</div>
							) : (
								<button
									type="button"
									onClick={() => setConfirmRemove(true)}
									className="w-full text-left px-3 py-2 text-sm text-red-600 bg-white hover:bg-red-100 rounded-xl">
									Retirer du salon
								</button>
							)}
						</div>
					)}
				</div>
			</aside>
		)
	}

	return (
		<aside className="absolute top-0 right-0 h-full w-90 shadow-2xl rounded-3xl flex flex-col gap-2 p-4 bg-gray-100 z-10">
			<span className="flex items-center gap-2">
				<BackButton onClick={onBack} />
				<h2 className="view-title">Infos
					{channel.type === 'discussion' ? " de l'utilisateur" : ''}
					{channel.type === 'group' ? ' du groupe' : ''}
					{channel.type === 'channel' ? ' du canal' : ''}
				</h2>
			</span>

			<div className="flex flex-1 flex-col items-center gap-2 font-semibold text-gray-800 py-2 min-h-0">
				{channel.type === 'discussion' && otherProfile?.avatarUrl ? (
					<img
						src={otherProfile.avatarUrl}
						alt={channel.name ?? ''}
						className="w-30 h-30 rounded-full object-cover"
					/>
				) : (
					<span
						className={`avatar-circle w-30 h-30 text-6xl ${channel.type === 'discussion' ? 'bg-user' : 'bg-conversation'}`}>
						{channel.name?.charAt(0).toUpperCase() ?? '?'}
					</span>
				)}

				<div className="flex items-center justify-center gap-2 max-w-full px-2">
					{isEditingName ? (
						<form onSubmit={handleRename}>
							<input
								autoFocus
								value={nameInput}
								onChange={(e) => setNameInput(e.target.value)}
								onBlur={() => setIsEditingName(false)}
								maxLength={255}
								className="font-bold text-gray-800 text-lg border-b border-blue-400 focus:outline-none bg-transparent text-center"
							/>
						</form>
					) : (
						<>
							<h1 className="font-bold text-gray-800 text-lg truncate">{channel.name}</h1>
							{channel.type !== 'discussion' && isModerator && (
								<button
									type="button"
									onClick={() => {
										setNameInput(channel.name ?? '')
										setIsEditingName(true)
									}}
									title="renommer"
									className="text-gray-400 hover:text-gray-700 text-sm">
									🖋
								</button>
							)}
						</>
					)}
				</div>
				{channel.type === 'discussion' && otherProfile?.isOnline !== undefined && (
					<span className={`text-sm ${otherProfile.isOnline ? 'text-green-500' : 'text-red-500'}`}>
						{otherProfile.isOnline ? 'En ligne' : 'Hors ligne'}
					</span>
				)}

				<span className="text-black/50 text-xs">
					{channel.type !== 'discussion' && members !== null && (
						<span>{members.length} {channel.type === 'group' ? 'membre' : 'abonné'}{members.length > 1 ? 's' : ''}</span>
					)}
				</span>
				{channel.type === 'discussion' && otherProfile && (
					<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-2">
						<h2 className="font-bold">ⓘ bio</h2>
						<p className="whitespace-pre-line wrap-break-word">
							{otherProfile.bio || <span className="text-gray-300 italic">Aucune bio</span>}
						</p>
					</div>
				)}

				{channel.type !== 'discussion' && (
					<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-3 shadow-sm border border-gray-100">
						<div className="flex items-center justify-between">
							<h2 className="font-bold text-gray-700 flex items-center gap-1">
							</h2>
							{isModerator && (
								<button
									type="button"
									onClick={() => {
										setDescInput(channel.description ?? '')
										setIsEditingDesc(true)
									}}
									title="modifier la description"
									className="text-gray-400 hover:text-gray-700 text-sm">
									🖋
								</button>
							)}
						</div>

						{isEditingDesc ? (
							<form onSubmit={handleUpdateDescription} className="mt-1">
								<input
									autoFocus
									value={descInput}
									onChange={(e) => setDescInput(e.target.value)}
									onBlur={() => setIsEditingDesc(false)}
									placeholder="Ajouter une description..."
									maxLength={255}
									className="w-full text-gray-800 border-b border-blue-400 focus:outline-none bg-transparent text-sm py-1"
								/>
							</form>
						) : (
							<p className="whitespace-pre-wrap break-words text-gray-600 mt-1">
								{channel.description || <span className="italic text-gray-400">Aucune description</span>}
							</p>
						)}
					</div>
				)}

				{channel.type === 'channel' && isModerator && (
					<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-3 shadow-sm border border-gray-100">
						<div className="flex items-center justify-between">
							<span className="font-bold text-gray-700">ⓘ Qui peut écrire</span>
						</div>
						<div className="flex items-center justify-between mt-1">
							<span className="text-gray-600 text-xs">
								{channel.writeMode === 'moderators_only' ? 'Modérateurs uniquement' : 'Tout le monde'}
							</span>
							<button
								type="button"
								onClick={handleToggleWriteMode}
								disabled={isSavingWriteMode}
								className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50">
								{isSavingWriteMode ? '...' : 'Changer'}
							</button>
						</div>
					</div>
				)}

				{channel.type !== 'discussion' && (
					<div className="flex flex-1 flex-col self-stretch gap-1 mt-2 bg-white rounded-2xl p-2 min-h-0 overflow-y-auto shadow-sm border border-gray-100">
						<div className="flex items-center justify-between px-1 pb-1 border-b border-gray-100">
							<span className="text-xs font-bold text-gray-600 uppercase">
								Membres ({members?.length ?? 0})
							</span>
							{isModerator && (
								<button
									type="button"
									onClick={() => {
										setSelectedMemberIds(new Set())
										setExtraUsers([])
										setPseudoInput('')
										setSearchError(null)
										setIsAddingMembers(!isAddingMembers)
									}}
									className="text-xs font-semibold text-blue-600 hover:underline">
									{isAddingMembers ? 'Fermer' : '+ Ajouter'}
								</button>
							)}
						</div>

						{isAddingMembers ? (
							<div className="flex flex-col gap-2 py-1 flex-1 overflow-y-auto">
								<div className="flex gap-2">
									<input
										value={pseudoInput}
										onChange={(e) => {
											setPseudoInput(e.target.value)
											if (e.target.value.trim() === '')
												setSearchError(null)
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												handleAddByPseudo()
											}
										}}
										placeholder="Rechercher par pseudo"
										maxLength={255}
										className="min-w-0 flex-1 border border-gray-300 rounded-2xl px-2.5 py-1 text-xs hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
									/>
									<button
										type="button"
										onClick={handleAddByPseudo}
										className="text-xs bg-blue-500 text-white rounded-xl px-2.5 py-1 hover:bg-blue-600 font-semibold">
										Ajouter
									</button>
								</div>
								{searchError && <p className="text-xs text-red-600">{searchError}</p>}

								{selectableUsers.length === 0 ? (
									<p className="text-xs italic text-gray-400 py-3 text-center">Aucun utilisateur disponible</p>
								) : (
									<>
										<div className="flex flex-col gap-1 flex-1 overflow-y-auto">
											{selectableUsers.map((user) => (
												<AvatarNameCard
													key={`user-${user.id}`}
													name={user.pseudo}
													variant="user"
													selected={selectedMemberIds.has(user.id)}
													onClick={() => toggleMemberSelect(user.id)}
												/>
											))}
										</div>
										<button
											type="button"
											disabled={selectedMemberIds.size === 0}
											onClick={handleConfirmAddMembers}
											className="w-full bg-blue-500 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition mt-1">
											Confirmer l'ajout ({selectedMemberIds.size})
										</button>
									</>
								)}
							</div>
						) : (
							<div className="flex flex-col gap-1 flex-1 overflow-y-auto">
								{members && members.map((m) => (
									<AvatarNameCard
										key={m.userId}
										name={m.pseudo}
										variant="user"
										avatarUrl={m.avatarUrl}
										subtitle={m.role === 'moderator' ? 'Modérateur' : undefined}
										onClick={() => handleSelectMember(m)}
									/>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			<button
				type="button"
				onClick={() => (
					onDeleteChannel(channel.id)
				)}
				className="mt-auto w-full text-left px-3 py-2 text-sm text-danger bg-white hover:bg-danger-bg rounded-xl">
				Supprimer la conversation
			</button>
		</aside>
	)
}

export default InfoPanel