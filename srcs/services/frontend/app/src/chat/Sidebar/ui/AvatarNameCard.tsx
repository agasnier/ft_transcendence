interface AvatarNameCardProps {
	name: string
	subtitle?: string
	selected?: boolean
	variant?: 'conversation' | 'user'
	onClick?: () => void
	isOnline?: boolean
}

function AvatarNameCard({ name, subtitle, selected = false, variant, onClick, isOnline }: AvatarNameCardProps) {
	return (
		<button
			onClick={onClick}
			className={`group flex text-left font-bold px-3 py-2 rounded-2xl ${selected ? 'bg-blue-400' : 'hover:bg-gray-100'} `}>
			<span className="relative shrink-0">
				<span
					className={`avatar-circle text-2xl border font-thin w-15 h-15 ${variant === 'user' ? 'bg-user' : 'bg-conversation'}`}>
					{name.charAt(0).toUpperCase()}
				</span>
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
			<span className="flex flex-col text-lg min-w-0 px-3">
				<span className={`truncate ${selected ? 'text-white' : ''}`}>
					{name}
				</span>
				{subtitle && (
					<span className={`text-xs font-normal truncate ${selected ? 'text-white/80' : 'text-black/50'}`}>
						{subtitle}
					</span>
				)}
			</span>
		</button>
	)
}

export default AvatarNameCard
