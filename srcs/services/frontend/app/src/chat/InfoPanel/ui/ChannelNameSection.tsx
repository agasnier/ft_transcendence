import { useState, useEffect } from 'react'

interface Channel {
	id: number
	name: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface PublicProfile {
	isOnline: boolean
}

interface ChannelNameSectionProps {
	channel: Channel
	isModerator: boolean
	otherProfile: PublicProfile | null
	memberCount: number | null
	onRenameChannel: (id: number, name: string) => Promise<boolean>
}

function ChannelNameSection({channel, isModerator, otherProfile, memberCount, onRenameChannel}: ChannelNameSectionProps) {
	const [isEditingName, setIsEditingName] = useState(false)
	const [nameInput, setNameInput] = useState(channel.name ?? '')

	useEffect(() => {
		setNameInput(channel.name ?? '')
		setIsEditingName(false)
	}, [channel.id, channel.name])

	async function handleRename(e: React.FormEvent) {
		e.preventDefault()
		if (!nameInput.trim())
			return
		const ok = await onRenameChannel(channel.id, nameInput.trim())
		if (ok)
			setIsEditingName(false)
	}

	return (
		<>
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
				{channel.type !== 'discussion' && memberCount !== null && (
					<span>{memberCount} {channel.type === 'group' ? 'membre' : 'abonné'}{memberCount > 1 ? 's' : ''}</span>
				)}
			</span>
		</>
	)
}

export default ChannelNameSection
