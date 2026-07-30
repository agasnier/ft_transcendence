interface BackButtonProps {
	onClick: () => void
}

function BackButton({ onClick }: BackButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-12 h-12 bg-white text-2xl text-gray-500 leading-none flex items-center justify-center hover:bg-gray-200 rounded-full">
			⟲
		</button>
	)
}

export default BackButton
