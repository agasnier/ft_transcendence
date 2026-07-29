import UserMenu from '../UserMenu'
import ConversationsPanel from '../ConversationsPanel'

function HomeView({ onLogout, pseudo, rooms, selectedRoomId, onSelectRoom, searchQuery, setSearchQuery, setView }: any) {
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

            <ConversationsPanel
                isSearching={false}
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={onSelectRoom}
            />

            <div className="relative mt-auto self-end">
                <button
                    type="button"
                    className="mt-auto self-end bg-blue-500 text-white font-bold w-13 h-13 rounded-full hover:bg-blue-600 flex items-center justify-center text-4xl"
                    title="Créer un salon">
                    +
                </button>
            </div>
        </>
    )
}

export default HomeView