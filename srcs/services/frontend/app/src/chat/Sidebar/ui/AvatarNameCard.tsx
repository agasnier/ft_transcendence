interface AvatarNameCardProps {
	name: string
	subtitle?: string
	selected?: boolean
	variant?: 'conversation' | 'user'
	onClick?: () => void
}

function AvatarNameCard({ name, subtitle, selected = false, variant, onClick }: AvatarNameCardProps) {
	return (
		<button
			onClick={onClick}
			className={`flex text-left font-bold px-3 py-2 rounded-2xl ${selected ? 'bg-blue-400' : 'hover:bg-gray-100'} `}>
			<span
				className={`avatar-circle text-2xl border font-thin w-15 h-15 ${variant === 'user' ? 'bg-blue-500' : 'bg-orange-400'}`}>
				{name.charAt(0).toUpperCase()}
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
