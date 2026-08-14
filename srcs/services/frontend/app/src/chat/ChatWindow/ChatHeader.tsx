import { useState, useEffect } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { usePolling } from '../../hooks/usePolling'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface ChatHeaderProps {
	channel: Channel
	UserId: number | null
	onDeleteChannel: (id: number) => void
	onRenameChannel: (id: number, name: string) => Promise<boolean>
}

function ChatHeader({channel, onDeleteChannel, onRenameChannel}: ChatHeaderProps) {
	const [optionMenu, setOptionMenu] = useState(false)
	const [isEditingName, setIsEditingName] = useState(false)
	const [nameInput, setNameInput] = useState(channel.name ?? '')
	const [memberCount, setMemberCount] = useState<number | null>(null)
	const [isOnline, setIsOnline] = useState<boolean | null>(null)

	useEffect(() => {
		if (channel.type === 'discussion')
			return

		async function loadCount() {
			const res = await fetch(`/chat/channels/${channel.id}/members`)
			if (res.ok)
				setMemberCount((await res.json()).length)
		}
		loadCount()
	}, [channel.id, channel.type])

	usePolling(async () => {
		if (channel.type !== 'discussion')
			return

		const res = await fetch('/friends')
		if (!res.ok)
			return

		const friends = await res.json() as { pseudo: string; isOnline: boolean }[]
		const match = friends.find((f) => f.pseudo === channel.name)
		setIsOnline(match?.isOnline ?? null)
	}, 5000)

	useClickOutside(optionMenu, '[data-menu-popover]', () => setOptionMenu(false))

	async function handleRename(e: React.FormEvent) {
		e.preventDefault()
		if (!nameInput.trim())
			return
		const ok = await onRenameChannel(channel.id, nameInput.trim())
		if (ok)
			setIsEditingName(false)
	}

	return (
		<div className="flex p-1 border-b bg-white/50 items-center justify-between">
			<div className="flex items-center gap-4 min-w-0">
				<span
					className="avatar-circle bg-orange-400 font-thin w-10 h-10">
					{channel.name?.charAt(0).toUpperCase()}
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
					<span className="text-black/50 truncate">
						{channel.type === 'discussion' && isOnline !== null && (
							<span className={`${isOnline ? 'text-green-500' : 'text-red-600'}`}>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
						)}
						{channel.type !== 'discussion' && memberCount !== null && (
							<span>{memberCount} {channel.type === 'group' ? 'membre' : 'abonné'}{memberCount > 1 ? 's' : ''}</span>
						)}
					</span>
				</div>
			</div>
			<div className="flex items-center gap-3 shrink-0">
				<span data-menu-popover className="relative">
					<button
						type="button"
						onClick={() => setOptionMenu((prev) => !prev)}
						title="Menu"
						className="icon-button text-2xl text-right font-bold text-gray-600 w-10 h-10">
						⋮
					</button>
					{optionMenu && (
						<div className="absolute z-20 top-full right-0 mt-2 w-58 bg-white border rounded-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.15)] p-1">
							{channel.type !== 'discussion' && <button
								type="button"
								onClick={() => {
									setOptionMenu(false)
								}}
								className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-xl">
								{channel.type === 'group' ? '👥​ Membres' : '👥​ Abonnés'}
							</button>}
							{channel.type !== 'discussion' && <button
								type="button"
								onClick={() => {
									setNameInput(channel.name ?? '')
									setIsEditingName(true)
									setOptionMenu(false)
								}}
								className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-xl">
								🖊️​ Renommer le channel
							</button>}
							<button
								type="button"
								onClick={() => {
									onDeleteChannel(channel.id)
									setOptionMenu(false)
								}}
								className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl">
								🗑️​ Supprimer la conversation
							</button>
						</div>
					)}
				</span>
			</div>
		</div>
	)
}

export default ChatHeader
