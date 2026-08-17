import { useState, useEffect } from 'react'
import BackButton from "../Sidebar/ui/BackButton"
import AvatarNameCard from '../Sidebar/ui/AvatarNameCard'

interface Member {
	userId: number
	role: 'moderator' | 'member'
	pseudo: string
}

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface InfoPanelProps {
	channel: Channel
	userId: number | null
	onBack: () => void
	onDeleteChannel: (id: number) => void
	onRenameChannel: (id: number, name: string) => Promise<boolean>
}

function InfoPanel({ channel, userId, onBack, onDeleteChannel, onRenameChannel }: InfoPanelProps) {
	const [isEditingName, setIsEditingName] = useState(false)
	const [nameInput, setNameInput] = useState(channel.name ?? '')
	const [members, setMembers] = useState<Member[] | null>(null)
	const isModerator = members?.some((m) => m.userId === userId && m.role === 'moderator') ?? false

	useEffect(() => {
		if (channel.type === 'discussion')
			return

		async function loadMembers() {
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
			const users: { id: number; pseudo: string }[] = await usersRes.json()
			const pseudoById = new Map(users.map((u) => [u.id, u.pseudo]))
			const members: Member[] = rows.map((r) => ({ ...r, pseudo: pseudoById.get(r.userId) ?? '?' }))
			members.sort((a, b) => {
				if (a.role !== b.role)
					return a.role === 'moderator' ? -1 : 1
				return a.pseudo.localeCompare(b.pseudo)
			})
			setMembers(members)
		}
		loadMembers()
	}, [channel.id, channel.type])

	async function handleRename(e: React.FormEvent) {
		e.preventDefault()
		if (!nameInput.trim())
			return
		const ok = await onRenameChannel(channel.id, nameInput.trim())
		if (ok)
			setIsEditingName(false)
	}

	return (
		<aside className="absolute top-0 right-0 h-full w-90 shadow-2xl rounded-3xl flex flex-col gap-2 p-4 bg-gray-100 z-10">
			<span className="flex items-center gap-2">
				<BackButton onClick={onBack} />
				<h2 className="text-xl font-bold">Infos
					{channel.type === 'discussion' ? " de l'utilisateur" : ''}
					{channel.type === 'group' ? ' du groupe' : ''}
					{channel.type === 'channel' ? ' du canal' : ''}
				</h2>
				{channel.type !== 'discussion' && isModerator && (
					<button
						type="button"
						onClick={() => {
							setNameInput(channel.name ?? '')
							setIsEditingName(true)
						}}
						title="renommer"
						className="icon-button text-2xl font-bold text-gray-600 w-12 h-12 ml-auto">
						🖋
					</button>
				)}
			</span>
			<div className="flex flex-1 flex-col items-center gap-2 font-semibold text-gray-800 py-2 min-h-0">
				<span
					className={`avatar-circle w-30 h-30 text-6xl ${channel.type === 'discussion' ? 'bg-blue-500' : 'bg-orange-400'}`}>
					{channel.name?.charAt(0).toUpperCase() ?? '?'}
				</span>
				<div className="flex flex-col min-w-0">
					{isEditingName ? (
						<form onSubmit={handleRename}>
							<input
								autoFocus
								value={nameInput}
								onChange={(e) => setNameInput(e.target.value)}
								onBlur={() => setIsEditingName(false)}
								maxLength={255}
								className="font-bold text-gray-800 text-lg border-b border-blue-400 focus:outline-none"
								/>
						</form>
					) : (
						<h1 className="font-bold text-gray-800 text-lg truncate">{channel.name}</h1>
					)}
				</div>
				<span className="text-black/50">
					{channel.type !== 'discussion' && members !== null && (
						<span>{members.length} {channel.type === 'group' ? 'membre' : 'abonné'}{members.length > 1 ? 's' : ''}</span>
					)}
				</span>
				{channel.description && (
					<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-2">
						<h2 className="font-bold">ⓘ description</h2>
						<p className="whitespace-pre-wrap wrap-break-word">{channel.description}</p>
					</div>
				)}
				{/* list of all the members */}
				{channel.type != 'discussion' && members && members.length > 0 && (
					<div className="flex flex-1 flex-col self-stretch gap-1 mt-2 bg-white rounded-2xl p-2 min-h-0 overflow-y-auto">
						{members.map((m) => (
							<AvatarNameCard
								key={m.userId}
								name={m.pseudo}
								variant="user"
								subtitle={m.role === 'moderator' ? 'Modérateur' : undefined}/>
						))}
					</div>
				)}
			</div>
			<button
				type="button"
				onClick={() => (
					onDeleteChannel(channel.id)
				)}
				className="mt-auto w-full text-left px-3 py-2 text-sm text-red-600 bg-white hover:bg-red-100 rounded-xl">
				🗑️​ Supprimer la conversation
			</button>
		</aside>
	)
}

export default InfoPanel
