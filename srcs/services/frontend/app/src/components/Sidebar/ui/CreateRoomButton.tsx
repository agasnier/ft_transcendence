import { useState, useEffect } from 'react'
import type { SidebarView } from '../Sidebar'

interface CreateRoomButtonProps {
		setView: (view: SidebarView) => void
		
}

function CreateRoomButton({setView}: CreateRoomButtonProps) {
	const [confirmSelection, setConfirmSelection] = useState(false)
	
	useEffect(() => {
		if (confirmSelection === false)
			return

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setView({ kind: 'home' })
				setConfirmSelection(false)
				;(document.activeElement as HTMLElement)?.blur()
			}
		}

		function handleClickOutside(event: MouseEvent) {
			if (!(event.target as HTMLElement).closest('[data-create-room-popover]')) {
				setView({ kind: 'home' })
				setConfirmSelection(false)
				;(document.activeElement as HTMLElement)?.blur()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [confirmSelection])

	return (
		<div data-create-room-popover
			className="relative mt-auto self-end">
			<button
				type="button"
				onClick={() => setConfirmSelection((prev) => (prev === true ? false : true))}
				title="Créer un salon"
				className="mt-auto self-end bg-blue-500 text-white font-bold w-13 h-13 rounded-full hover:bg-blue-600 flex items-center justify-center text-4xl">
				+
			</button>
			{confirmSelection === true && (
				<div
					className="absolute bottom-full right-0 mb-2 w-55 bg-white rounded-2xl p-1 shadow flex flex-col">
						<>
							<button 
								onClick={() => setView({ kind: 'createChannel' })}
								className="text-left px-1 py-2 font-bold rounded-2xl hover:bg-gray-100">
								📢 Nouveau canal
							</button>
							<button 
								onClick={() => setView({ kind: 'createGroup' })}
								className="text-left px-1 py-2 font-bold rounded-2xl hover:bg-gray-100">
								👥 Nouveau groupe
							</button>
							<button 
								onClick={() => setView({ kind: 'createDiscussion' })}
								className="text-left px-1 py-2 font-bold rounded-2xl hover:bg-gray-100">
								👤 Nouvelle discussion
							</button>
						</>
				</div>
			)}
		</div>
	)
}

export default CreateRoomButton
