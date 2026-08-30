import { useState, useEffect } from 'react'
import { IconEdit } from '../../../icons'
import { MAX_SHORT_TEXT_LENGTH } from '../../../limits'

interface Channel {
	id: number
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface DescriptionSectionProps {
	channel: Channel
	isModerator: boolean
	onUpdateDescription?: (id: number, description: string) => Promise<boolean>
}

function DescriptionSection({ channel, isModerator, onUpdateDescription }: DescriptionSectionProps) {
	const [isEditingDesc, setIsEditingDesc] = useState(false)
	const [descInput, setDescInput] = useState(channel.description ?? '')

	useEffect(() => {
		setDescInput(channel.description ?? '')
		setIsEditingDesc(false)
	}, [channel.id, channel.description])

	async function handleUpdateDescription(e: React.FormEvent) {
		e.preventDefault()
		if (onUpdateDescription) {
			const ok = await onUpdateDescription(channel.id, descInput.trim())
			if (ok)
				setIsEditingDesc(false)
		}
	}

	return (
		<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-3 shadow-sm border border-gray-100">
			{isEditingDesc ? (
				<form onSubmit={handleUpdateDescription} className="mt-1">
					<input
						autoFocus
						value={descInput}
						onChange={(e) => setDescInput(e.target.value)}
						onBlur={() => setIsEditingDesc(false)}
						placeholder="Ajouter une description..."
						maxLength={MAX_SHORT_TEXT_LENGTH}
						className="w-full text-gray-800 border-b border-blue-400 focus:outline-none bg-transparent text-sm py-1"
					/>
				</form>
			) : (
				<div className="flex items-center justify-between gap-2">
					<p className="whitespace-pre-wrap wrap-break-word text-gray-600 mt-1">
						{channel.description || <span className="italic text-gray-400">Aucune description</span>}
					</p>
					{isModerator && (
						<button
							type="button"
							onClick={() => {
								setDescInput(channel.description ?? '')
								setIsEditingDesc(true)
							}}
							title="modifier la description"
							className="text-gray-500">
							<IconEdit size={20} className="icon-hover-grow"/>
						</button>
					)}
				</div>
			)}
		</div>
	)
}

export default DescriptionSection
