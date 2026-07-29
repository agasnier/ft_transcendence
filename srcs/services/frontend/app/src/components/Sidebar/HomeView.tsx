import { useState, useEffect } from 'react'
import UserMenu from '../UserMenu'
import ConversationsPanel from '../ConversationsPanel'
import CreateRoomForm from '../CreateRoomForm'
import FriendsPanel from '../FriendsPanel'
import type { SidebarView } from './Sidebar'

interface Room {
	id: number
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

interface HomeViewProps {
	onLogout: () => void
	pseudo: string | null
	rooms: Room[]
	selectedRoomId: number | null
	onSelectRoom: (id: number) => void
	onCreateRoom: (name: string, description: string, type: 'channel' | 'group' | 'discussion') => void
	searchQuery: string
	setSearchQuery: (query: string) => void
	setView: (view: SidebarView) => void
}

function HomeView({ onLogout, pseudo, rooms, selectedRoomId, onSelectRoom, onCreateRoom, searchQuery, setSearchQuery, setView }: HomeViewProps) {
	const [activeTab, setActiveTab] = useState<'friends' | 'conversations'>('conversations')
	const [confirmSelection, setConfirmSelection] = useState<boolean>(false)
	const [creatingType, setCreatingType] = useState<'channel' | 'group' | 'discussion' | null>(null)

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
		<>
			<div className="flex items-center gap-2">
				<UserMenu onLogout={onLogout} pseudo={pseudo} />
				<div className="relative flex-1 min-w-0">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="🔍︎ Rechercher"
						onFocus={() => setView({ kind: 'search' })}
						className="w-full text-lg rounded-full pl-3 pr-9 py-2 border border-transparent hover:border hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white bg-gray-100"
					/>
                    {searchQuery !== '' && (
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setSearchQuery('')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-100">
                        ✕
                    </button>
                )}
                </div>
            </div>
            <div className="flex bg-gray-100 rounded-full p-1 gap-1">
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
            {activeTab === 'friends' && 
                <FriendsPanel
                    searchQuery={searchQuery}
                    isSearching={false}
                />
            }
            {activeTab === 'conversations' && 
                <ConversationsPanel
                    isSearching={false}
                    searchQuery={searchQuery}
                    rooms={rooms}
                    selectedRoomId={selectedRoomId}
                    onSelectRoom={onSelectRoom}
                />
            }
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
		</>
	)
}

export default HomeView