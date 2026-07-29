import { useState } from 'react'
import UserMenu from '../UserMenu'
import ConversationsPanel from '../ConversationsPanel'
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
	searchQuery: string
	setView: (view: SidebarView) => void
}

function HomeView({ onLogout, pseudo, rooms, selectedRoomId, onSelectRoom, searchQuery, setView }: HomeViewProps) {
	const [activeTab, setActiveTab] = useState<'friends' | 'conversations'>('conversations')

	return (
		<>
			<div className="flex items-center gap-2">
				<UserMenu onLogout={onLogout} pseudo={pseudo} />
				<div className="relative flex-1 min-w-0">
					<input
						type="text"
						placeholder="🔍︎ Rechercher"
						onFocus={() => setView({ kind: 'search' })}
						className="w-full text-lg rounded-full pl-3 pr-9 py-2 border border-transparent hover:border hover:border-gray-500 bg-gray-100"
					/>
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
		</>
	)
}

export default HomeView
