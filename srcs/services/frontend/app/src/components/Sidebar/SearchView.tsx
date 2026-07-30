import { useState, useEffect } from 'react'
import FriendsPanel from '../FriendsPanel'
import ConversationsPanel from './ConversationsPanel'
import BackButton from './BackButton'
import type { SidebarView } from './Sidebar'

interface Room {
	id: number
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

interface SearchViewProps {
	searchQuery: string
	setSearchQuery: (query: string) => void
	setView: (view: SidebarView) => void
	rooms: Room[]
	selectedRoomId: number | null
	onSelectRoom: (id: number) => void
}

function SearchView({ searchQuery, setSearchQuery, setView, rooms, selectedRoomId, onSelectRoom }: SearchViewProps) {
    const [searchScope, setSearchScope] = useState<'conversations' | 'friends'>('conversations')

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setSearchQuery('')
                setView({ kind: 'home' })
                ;(document.activeElement as HTMLElement)?.blur()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <>
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
                <FriendsPanel searchQuery={searchQuery} isSearching={true} />
            }
            {searchQuery.trim() !== '' && searchScope === 'conversations' &&
                <ConversationsPanel
                    isSearching={true}
                    searchQuery={searchQuery}
                    rooms={rooms}
                    selectedRoomId={selectedRoomId}
                    onSelectRoom={onSelectRoom}
                />
            }
        </>
    )
}

export default SearchView
