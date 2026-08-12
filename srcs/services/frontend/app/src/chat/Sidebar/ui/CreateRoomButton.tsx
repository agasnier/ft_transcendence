import { useState } from 'react'
import type { SidebarView } from '../Sidebar'
import { useClickOutside } from '../../../hooks/useClickOutside'

interface CreateRoomButtonProps {
		setView: (view: SidebarView) => void
		
}

function CreateRoomButton({setView}: CreateRoomButtonProps) {
	const [confirmSelection, setConfirmSelection] = useState(false)
	
	useClickOutside(confirmSelection, '[data-create-room-popover]', () => {
		setView({ kind: 'home' })
		setConfirmSelection(false)
	})

	return (
		<div data-create-room-popover
			className="relative mt-auto self-end">
			<button
				type="button"
				onClick={() => setConfirmSelection((prev) => (prev === true ? false : true))}
				title="Créer un salon"
				className="fab-button">
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
