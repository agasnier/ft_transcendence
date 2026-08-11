import FriendsPanel from '../ui/FriendsPanel'
import ConversationsPanel from '../ui/ConversationsPanel'
import BackButton from '../ui/BackButton'
import type { SidebarView } from '../Sidebar'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface SearchViewProps {
	searchQuery: string
	setSearchQuery: (query: string) => void
	setView: (view: SidebarView) => void
	userId: number | null
	channels: Channel[]
	selectedChannelId: number | null
	onSelectChannel: (id: number) => void
	onCreateChannel: (type: 'channel' | 'group' | 'discussion', memberIds: number[], name?: string, description?: string) => Promise<Channel | null>
    activeTab: 'friends' | 'conversations'
    setActiveTab: (tab: 'friends' | 'conversations') => void
}

function SearchView({ searchQuery, setSearchQuery, setView, userId, channels, selectedChannelId, onSelectChannel, onCreateChannel, activeTab, setActiveTab }: SearchViewProps) {

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <BackButton
                    onClick={() => {
                        setSearchQuery('')
                        setView({ kind: 'home' })
                    }}
                />
                <div className="relative flex-1 min-w-0">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="🔍︎ Rechercher"
                        autoFocus
                        className="search-input focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
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
                    className={`tab-button ${activeTab === 'friends' ? 'bg-blue-100 text-blue-500' : ''}`}>
                    Amis
                </button>
            </div>
            {searchQuery.trim() !== '' && activeTab === 'friends' &&
                <FriendsPanel
                    searchQuery={searchQuery}
                    isSearching={true}
                    userId={userId}
                    onCreateChannel={onCreateChannel}
                    onSelectChannel={onSelectChannel}
                />
            }
            {searchQuery.trim() !== '' && activeTab === 'conversations' &&
                <ConversationsPanel
                    isSearching={true}
                    searchQuery={searchQuery}
                    channels={channels}
                    selectedChannelId={selectedChannelId}
                    onSelectChannel={onSelectChannel}
                />
            }
        </div>
    )
}

export default SearchView
