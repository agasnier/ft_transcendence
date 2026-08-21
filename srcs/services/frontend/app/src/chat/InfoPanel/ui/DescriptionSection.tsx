import { useState, useEffect } from 'react'

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
				<p className="whitespace-pre-wrap wrap-break-word text-gray-600 mt-1">
					{channel.description || <span className="italic text-gray-400">Aucune description</span>}
				</p>
			)}
		</div>
	)
}

export default DescriptionSection
