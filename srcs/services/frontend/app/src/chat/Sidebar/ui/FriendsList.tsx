import { useOnlineUsers } from '../../../hooks/presence'

interface Friend {
    id: number
    pseudo: string
    avatarUrl: string | null
}

interface FriendsListProps {
    friends: Friend[]
    isSearching: boolean
    confirmRemoveId: number | null
    setConfirmRemoveId: (id: number | null) => void
    onRemove: (id: number) => void
    onMessagePrivate: (id: number) => void
}

function FriendsList({ friends, isSearching, confirmRemoveId, setConfirmRemoveId, onRemove, onMessagePrivate }: FriendsListProps) {
    const onlineUserIds = useOnlineUsers()

    return (
        <div className={`${isSearching ? 'bg-white' : 'bg-gray-100'} rounded-3xl p-4`}>
            <h2 className="font-semibold text-gray-700 mb-2">Amis</h2>
            {friends.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun ami</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {friends.map((friend) => (
                        <li key={friend.id} className="group flex items-center justify-between gap-2 px-2 py-1 rounded-2xl hover:bg-gray-200">
                            <span className="flex items-center gap-2">
                                <span className="relative shrink-0">
                                    {friend.avatarUrl ? (
                                        <img
                                            src={friend.avatarUrl}
                                            alt={friend.pseudo}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="avatar-circle bg-user w-8 h-8 text-sm font-semibold">
                                            {friend.pseudo?.charAt(0).toUpperCase() ?? '?'}
                                        </span>
                                    )}
                                    <span
                                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-100 ${onlineUserIds.has(friend.id) ? 'bg-green-500' : 'bg-gray-400'}`}
                                    />
                                </span>
                                <span className="text-sm text-gray-700">{friend.pseudo}</span>
                            </span>
                            <span data-remove-popover className="relative flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => onMessagePrivate(friend.id)}
                                    title="Message privé"
                                    className="icon-button text-black text-lg hover:bg-gray-300 w-7 h-7">
                                    ➣
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmRemoveId((confirmRemoveId === friend.id ? null : friend.id))}
                                    title="Plus"
                                    className="icon-button text-black text-lg hover:bg-gray-300 w-7 h-7">
                                    ⋮
                                </button>
                                {confirmRemoveId === friend.id && (
                                    <div
                                        className="absolute z-20 top-full right-0 mt-2 w-40 bg-white border rounded-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.15)] p-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onRemove(friend.id)
                                                setConfirmRemoveId(null)
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger-bg rounded-xl">
                                            Retirer l'ami
                                        </button>
                                    </div>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default FriendsList