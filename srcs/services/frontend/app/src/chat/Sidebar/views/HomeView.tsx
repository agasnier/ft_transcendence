import ConversationsPanel from '../ui/ConversationsPanel'
import FriendsPanel from '../ui/FriendsPanel'
import AdminPanel from '../ui/AdminPanel'
import type { SidebarView } from '../Sidebar'
import { IconMenu, IconSearch } from '../../../icons'
import { MAX_SHORT_TEXT_LENGTH } from '../../../limits'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

interface HomeViewProps {
    userId: number | null
    role: 'admin' | 'moderator' | 'user' | null
    channels: Channel[]
    selectedChannelId: number | null
    onSelectChannel: (id: number) => void
    onCreateChannel: (type: 'channel' | 'group' | 'discussion', memberIds: number[], name?: string, description?: string) => Promise<Channel | null>
    searchQuery: string
    setView: (view: SidebarView) => void
    activeTab: 'friends' | 'conversations' | 'admin'
    setActiveTab: (tab: 'friends' | 'conversations' | 'admin') => void
}

function HomeView({ userId, role, channels, selectedChannelId, onSelectChannel, onCreateChannel, searchQuery, setView, activeTab, setActiveTab }: HomeViewProps) {

    return (
        <div className="flex flex-col gap-2 h-full min-h-0">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setView({ kind: 'userMenu' })}
                    className="icon-button w-12 h-12"
                    title="Menu utilisateur">
                    <IconMenu size={24}/>
                </button>
                <div className="relative flex-1 min-w-0 px-1">
                    <IconSearch size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <input
                        type="text"
                        placeholder="Rechercher"
                        onFocus={() => setView({ kind: 'search' })}
                        maxLength={MAX_SHORT_TEXT_LENGTH}
                        autoComplete="off"
                        className="search-input pl-10"
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
                {role === 'admin' && (
                    <button
                        type="button"
                        onClick={() => setActiveTab('admin')}
                        className={`tab-button ${activeTab === 'admin' ? 'bg-blue-100 text-blue-500 hover:none' : ''}`}>
                        Administration
                    </button>
                )}
            </div>
            <div className="flex flex-1 flex-col min-h-0 overflow-y-auto gap-2">
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
                {activeTab === 'admin' && role === 'admin' &&
                    <AdminPanel currentUserId={userId} />
                }
            </div>
        </div>
    )
}

export default HomeView
