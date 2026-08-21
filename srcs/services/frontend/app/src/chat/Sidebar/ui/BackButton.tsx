import { IconBack } from '../../../icons'

interface BackButtonProps {
	onClick: () => void
}

function BackButton({ onClick }: BackButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="icon-button w-12 h-12 text-gray-500">
			<IconBack size={30}/>
		</button>
	)
}

export default BackButton
