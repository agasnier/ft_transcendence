import { useState, useEffect } from 'react'
import { IconEdit } from '../../../icons'
import { MAX_NAME_LENGTH, MAX_SHORT_TEXT_LENGTH } from '../../../limits'

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
			<div className="relative flex items-center justify-center max-w-full px-8">
				{isEditingName ? (
					<form onSubmit={handleRename} className="w-full">
						<input
							autoFocus
							value={nameInput}
							onChange={(e) => setNameInput(e.target.value)}
							onBlur={() => setIsEditingName(false)}
							maxLength={MAX_NAME_LENGTH}
							className="font-bold text-gray-800 text-lg border-b border-blue-400 focus:outline-none bg-transparent text-center w-full"
						/>
					</form>
				) : (
					<>
						<h1 className="font-bold text-gray-800 text-lg truncate text-center">{channel.name}</h1>
						{channel.type !== 'discussion' && isModerator && (
							<button
								type="button"
								onClick={() => {
									setNameInput(channel.name ?? '')
									setIsEditingName(true)
								}}
								title="renommer"
								className="absolute right-0 text-gray-500">
								<IconEdit size={14} className="icon-hover-grow"/>
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
