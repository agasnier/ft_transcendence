import { useState } from 'react'
import FriendsPanel from '../../FriendsPanel'
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
}

function SearchView({ searchQuery, setSearchQuery, setView, userId, channels, selectedChannelId, onSelectChannel, onCreateChannel }: SearchViewProps) {
    const [searchScope, setSearchScope] = useState<'conversations' | 'friends'>('conversations')

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
            <div className="flex bg-white rounded-full p-1 gap-1">
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
            {searchQuery.trim() !== '' && searchScope === 'friends' &&
                <FriendsPanel
                    searchQuery={searchQuery}
                    isSearching={true}
                    userId={userId}
                    onCreateChannel={onCreateChannel}
                    onSelectChannel={onSelectChannel}
                />
            }
            {searchQuery.trim() !== '' && searchScope === 'conversations' &&
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
