interface BackButtonProps {
	onClick: () => void
}

function BackButton({ onClick }: BackButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="icon-button w-12 h-12 text-2xl text-gray-500 leading-none">
			⟲
		</button>
	)
}

export default BackButton
