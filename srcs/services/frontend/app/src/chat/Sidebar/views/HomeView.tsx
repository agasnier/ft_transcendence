import UserMenu from '../ui/UserMenu'
import ConversationsPanel from '../ui/ConversationsPanel'
import FriendsPanel from '../ui/FriendsPanel'
import type { SidebarView } from '../Sidebar'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface HomeViewProps {
	onLogout: () => void
	pseudo: string | null
	userId: number | null
	channels: Channel[]
	selectedChannelId: number | null
	onSelectChannel: (id: number) => void
	onCreateChannel: (type: 'channel' | 'group' | 'discussion', memberIds: number[], name?: string, description?: string) => Promise<Channel | null>
	searchQuery: string
	setView: (view: SidebarView) => void
    activeTab: 'friends' | 'conversations'
    setActiveTab: (tab: 'friends' | 'conversations') => void
}

function HomeView({ onLogout, pseudo, userId, channels, selectedChannelId, onSelectChannel, onCreateChannel, searchQuery, setView, activeTab, setActiveTab }: HomeViewProps) {

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<UserMenu onLogout={onLogout} pseudo={pseudo} />
				<div className="relative flex-1 min-w-0">
					<input
						type="text"
						placeholder="🔍︎ Rechercher"
						onFocus={() => setView({ kind: 'search' })}
						className="search-input"
					/>
                </div>
            </div>
            <div className="tab-switcher">
                <button
                    type="button"
                    onClick={() => setActiveTab('conversations')}
                    className={`tab-button ${activeTab === 'conversations' ? 'bg-blue-100 text-blue-500' : ''}`}>
                    Conversations
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('friends')}
                    className={`tab-button ${activeTab === 'friends' ? 'bg-blue-100 text-blue-500 hover:none' : ''}`}>
                    Amis
                </button>
            </div>
            {activeTab === 'friends' &&
                <FriendsPanel
                    searchQuery={searchQuery}
                    isSearching={false}
                    userId={userId}
                    onCreateChannel={onCreateChannel}
                    onSelectChannel={onSelectChannel}
                />
            }
            {activeTab === 'conversations' && 
                <ConversationsPanel
                    isSearching={false}
                    searchQuery={searchQuery}
                    channels={channels}
                    selectedChannelId={selectedChannelId}
                    onSelectChannel={onSelectChannel}
                />
            }
		</div>
	)
}

export default HomeView
