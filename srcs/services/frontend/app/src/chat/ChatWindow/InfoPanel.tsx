import { useState, useEffect } from 'react'
import BackButton from "../Sidebar/ui/BackButton"

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface InfoPanelProps {
	channel: Channel
	onBack: () => void
	onDeleteChannel: (id: number) => void
	onRenameChannel: (id: number, name: string) => Promise<boolean>
}

function InfoPanel({ channel, onBack, onDeleteChannel, onRenameChannel }: InfoPanelProps) {
	const [isEditingName, setIsEditingName] = useState(false)
	const [nameInput, setNameInput] = useState(channel.name ?? '')
	const [memberCount, setMemberCount] = useState<number | null>(null)

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

	async function handleRename(e: React.FormEvent) {
		e.preventDefault()
		if (!nameInput.trim())
			return
		const ok = await onRenameChannel(channel.id, nameInput.trim())
		if (ok)
			setIsEditingName(false)
	}

	return (
		<aside className="absolute top-0 right-0 h-full w-90 shadow-2xl rounded-3xl flex flex-col overflow-y-auto gap-2 p-4 bg-gray-100 z-10">
			<span className="flex items-center justify-between gap-2">
				<BackButton onClick={onBack} />
				<h2 className="text-xl font-bold">Infos
					{channel.type === 'discussion' ? " de l'utilisateur" : ''}
					{channel.type === 'group' ? ' du groupe' : ''}
					{channel.type === 'channel' ? ' du canal' : ''}
				</h2>
				<button
					type="button"
					onClick={() => {
						setNameInput(channel.name ?? '')
						setIsEditingName(true)
					}}
					title="renommer"
					className="icon-button text-2xl text-right font-bold text-gray-600 w-12 h-12">
					🖋
				</button>
			</span>
			<div className="flex flex-col items-center gap-2 font-semibold text-gray-800 py-2">
				<span
					className="avatar-circle bg-blue-500 w-30 h-30 text-6xl">
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
					{channel.type !== 'discussion' && memberCount !== null && (
						<span>{memberCount} {channel.type === 'group' ? 'membre' : 'abonné'}{memberCount > 1 ? 's' : ''}</span>
					)}
				</span>
				{channel.description && (
					<div className="flex flex-col w-full h-18 text-sm font-normal justify-center rounded-2xl bg-white gap-1">
						ⓘ
						<h2>description</h2>
						<p>{channel.description}</p>
					</div>
				)}
			</div>
			<button
				type="button"
				onClick={() => onDeleteChannel(channel.id)}
				className="mt-auto w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-xl">
				🗑️​ Supprimer la conversation
			</button>
		</aside>
	)
}

export default InfoPanel
