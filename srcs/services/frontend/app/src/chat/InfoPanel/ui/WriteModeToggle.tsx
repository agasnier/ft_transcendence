import { useState } from 'react'
import { IconInfo } from '../../../icons'

interface Channel {
	id: number
	writeMode?: 'everyone' | 'moderators_only'
}

interface WriteModeToggleProps {
	channel: Channel
	onUpdateWriteMode?: (id: number, writeMode: 'everyone' | 'moderators_only') => Promise<boolean>
}

function WriteModeToggle({ channel, onUpdateWriteMode }: WriteModeToggleProps) {
	const [isSavingWriteMode, setIsSavingWriteMode] = useState(false)	

	async function handleToggleWriteMode() {
		if (!onUpdateWriteMode) return
		const newMode = channel.writeMode === 'moderators_only' ? 'everyone' : 'moderators_only'
		setIsSavingWriteMode(true)
		await onUpdateWriteMode(channel.id, newMode)
		setIsSavingWriteMode(false)
	}

	return (
		<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-3 shadow-sm border border-gray-100">
			<div className="flex items-center justify-between">
				<span className="flex items-center font-bold text-gray-700 gap-1"><IconInfo size={14}/> Qui peut écrire</span>
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
	)
}

export default WriteModeToggle
