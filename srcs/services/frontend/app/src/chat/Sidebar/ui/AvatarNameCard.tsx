interface AvatarNameCardProps {
	name: string
	selected?: boolean
	onClick?: () => void
}

function AvatarNameCard({ name, selected = false, onClick }: AvatarNameCardProps) {
	return (
		<button
			onClick={onClick}
			className={`flex text-left font-bold px-3 py-2 rounded-2xl ${selected ? 'bg-blue-400' : 'hover:bg-gray-100'} `}>
			<span
				className="bg-orange-400/90 text-white text-2xl font-thin rounded-full w-15 h-15 flex items-center justify-center shrink-0">
				{name.charAt(0).toUpperCase()}
			</span>
			<span className={`truncate min-w-0 px-3 ${selected ? 'text-white' : ''}`}>{name}</span>
		</button>
	)
}

export default AvatarNameCard
