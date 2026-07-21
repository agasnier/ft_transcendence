interface PrivacyFormProps {
	onBack: () => void
}

function PrivacyForm({ onBack }: PrivacyFormProps) {
	return (
		<div className="flex flex-col min-h-screen bg-gray-100">
			<h1 className="text-center text-black text-8xl">
				Politique de confidentialité
			</h1>
			<button
				type="button"
				onClick={onBack}
				className="text-black hover:underline">
				retour
			</button>
		</div>
	)
}

export default PrivacyForm
