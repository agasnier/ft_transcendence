interface AvatarNameCardProps {
    name: string
    subtitle?: string
    selected?: boolean
    variant?: 'conversation' | 'user'
    avatarUrl?: string | null
    onClick?: () => void
    isOnline?: boolean
    hasUnread?: boolean
}

function AvatarNameCard({ name, subtitle, selected = false, variant, avatarUrl, onClick, isOnline, hasUnread = false }: AvatarNameCardProps) {
    return (
        <button
            onClick={onClick}
            className={`group flex items-center text-left font-bold px-3 py-2 rounded-2xl ${selected ? 'bg-blue-400' : 'hover:bg-gray-100'} `}>
            <span className="relative shrink-0">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="w-15 h-15 rounded-full object-cover border"
                    />
                ) : (
                    <span
                        className={`avatar-circle text-2xl border w-15 h-15 ${variant === 'user' ? 'bg-user' : 'bg-conversation'}`}>
                        {name.charAt(0).toUpperCase()}
                    </span>
                )}
                {isOnline !== undefined && (
                    <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                            selected
                                ? 'border-blue-400'
                                : 'border-white group-hover:border-gray-100'
                        } ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                    />
                )}
            </span>
            <span className="flex flex-col text-lg min-w-0 flex-1 px-3 gap-2">
                <span className={`truncate ${selected ? 'text-white' : ''}`}>
                    {name}
                </span>
                {subtitle && (
                    <span className={`text-xs font-normal truncate ${selected ? 'text-white/80' : 'text-black/50'}`}>
                        {subtitle}
                    </span>
                )}
            </span>
            {hasUnread && !selected && (
                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            )}
        </button>
    )
}

export default AvatarNameCard