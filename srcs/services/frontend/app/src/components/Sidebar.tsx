import { useState, useEffect } from 'react'
import UserMenu from './UserMenu'
import FriendsPanel from './FriendsPanel'
import ConversationsPanel from './ConversationsPanel'
import CreateRoomForm from './CreateRoomForm'

interface SidebarProp {
	onLogout: () => void
	pseudo: string | null
	rooms: Room[]
	selectedRoomId: number | null
	onSelectRoom: (id: number) => void
	onCreateRoom: (name: string, description: string, type: 'channel' | 'group' | 'discussion') => void
}

interface Room {
	id: number
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

function Sidebar({onLogout, pseudo, rooms, selectedRoomId, onSelectRoom, onCreateRoom}: SidebarProp) {
	const [activeTab, setActiveTab] = useState<'friends' | 'conversations'>('conversations')
	const [searchQuery, setSearchQuery] = useState('')
	const [isSearching, setIsSearching] = useState(false)
	const [searchScope, setSearchScope] = useState<'conversations' | 'friends'>('conversations')
	const visiblePanel = isSearching ? searchScope : activeTab
	const [confirmSelection, setConfirmSelection] = useState<boolean>(false)
	const [creatingType, setCreatingType] = useState<'channel' | 'group' | 'discussion' | null>(null)

	useEffect(() => {
		if (!isSearching)
			return

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setIsSearching(false)
				setSearchQuery('')
				;(document.activeElement as HTMLElement)?.blur()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isSearching])

	useEffect(() => {
		if (!confirmSelection)
			return

		function handleClickOutside(event: MouseEvent) {
			if (!(event.target as HTMLElement).closest('[data-create-room-popover]')) {
				setConfirmSelection(false)
				setCreatingType(null)
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setConfirmSelection(false)
				setCreatingType(null)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [confirmSelection])

	return (
		<aside className={`w-100 shrink-0 shadow-2xl rounded-3xl flex flex-col overflow-y-auto gap-2 p-2 ${isSearching ? 'bg-gray-100' : 'bg-white'}`}>
			<div
				className="flex items-center gap-2">
				<UserMenu
					onLogout={onLogout}
					pseudo={pseudo}/>
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="🔍︎ Rechercher"
					onKeyDown={(e) => {
						if (e.key === 'Escape')
							e.currentTarget.blur()
					}}
					className="flex-1 min-w-0 text-lg bg-gray-100 rounded-full px-3 py-2 border border-transparent hover:border hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
				/>
			</div>
			{isSearching ? (
			<div
				className="flex bg-white rounded-full p-1 gap-1">
				<button
					type="button"
					onClick={() => setSearchScope('conversations')}
					className={`flex-1 text-lg font-medium py-2 rounded-full transition-colors hover:text-blue-500 ${searchScope === 'conversations' ? 'bg-blue-100 text-blue-500' : ''}`}>
					Conv
				</button>
				<button
					type="button"
					onClick={() => setSearchScope('friends')}
					className={`flex-1 text-lg font-medium py-2 rounded-full transition-colors hover:text-blue-500 ${searchScope === 'friends' ? 'bg-blue-100 text-blue-500' : ''}`}>
					User
				</button>
			</div>
			) : (
			<div
				className="flex bg-gray-100 rounded-full p-1 gap-1">
				<button
					type="button"
					onClick={() => setActiveTab('conversations')}
					className={`flex-1 text-lg font-medium py-2 rounded-full transition-colors hover:text-blue-500 ${activeTab === 'conversations' ? 'bg-blue-100 text-blue-500' : ''}`}>
					Conversations
				</button>
				<button
					type="button"
					onClick={() => setActiveTab('friends')}
					className={`flex-1 text-lg font-medium py-2 rounded-full transition-colors hover:text-blue-500 ${activeTab === 'friends' ? 'bg-blue-100 text-blue-500 hover:none' : ''}`}>
					Amis
				</button>
			</div>
			)}
			{visiblePanel === 'friends' && 
				(!isSearching || searchQuery.trim() !== '') && 
				<FriendsPanel
					searchQuery={searchQuery}
					isSearching={isSearching}
				/>
			}
			{visiblePanel === 'conversations' && 
				(!isSearching || searchQuery.trim() !== '') && 
				<ConversationsPanel
					isSearching={isSearching}
					rooms={rooms}
					selectedRoomId={selectedRoomId}
					onSelectRoom={onSelectRoom}
				/>
			}
			{!isSearching && (
				<div data-create-room-popover
					className="relative mt-auto self-end">
					<button
						type="button"
						onClick={() => setConfirmSelection((prev) => (prev === true ? false : true))}
						className="mt-auto self-end bg-blue-500 text-white font-bold w-13 h-13 rounded-full hover:bg-blue-600 flex items-center justify-center text-4xl"title="Créer un salon">
						+
					</button>
					{confirmSelection === true && (
						<div
							className="absolute bottom-full right-0 mb-2 w-55 bg-white rounded-2xl p-1 shadow flex flex-col">
							{creatingType === null ? (
								<>
									<button 
										onClick={() => setCreatingType('channel')}
										className="text-left px-1 py-2 font-bold rounded-2xl hover:bg-gray-100">
										📢 Nouveau canal
									</button>
									<button 
										onClick={() => setCreatingType('group')}
										className="text-left px-1 py-2 font-bold rounded-2xl hover:bg-gray-100">
										👥 Nouveau groupe
									</button>
									<button 
										onClick={() => setCreatingType('discussion')}
										className="text-left px-1 py-2 font-bold rounded-2xl hover:bg-gray-100">
										👤 Nouvelle discussion
									</button>
								</>
							) : (
								<CreateRoomForm
									type={creatingType}
									onCancel={() => setCreatingType(null)}
									onCreate={(name, description) => {
										onCreateRoom(name, description, creatingType)
										setCreatingType(null)
										setConfirmSelection(false)
									}}
								/>
							)}
						</div>
					)}
				</div>
			)}
		</aside>
	)
}

export default Sidebar
