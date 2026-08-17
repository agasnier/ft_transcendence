import { useEffect } from 'react'
import bg from '../../assets/site.webp'
import type { LegalContent } from '../content/LegalContent'

interface LegalViewProps {
	content: LegalContent
	onBack: () => void
}

function LegalView({content, onBack}: LegalViewProps) {

	useEffect (() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape')
				onBack()
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [onBack])

	return (
		<div className="relative isolate flex flex-col min-h-screen bg-gray-100 items-center py-12 px-4">
			<img
				src={bg}
				className="bg-image"
			/>
			<div className="bg-white/80 p-8 rounded-lg drop-shadow max-w-2xl w-full overflow-y-auto max-h-[80vh]">
				<h1 className="text-2xl font-bold text-black">{content.title}</h1>
				<p className="text-xs text-gray-500 mb-6">Dernière mise à jour : {content.lastUpdated}</p>
				{content.sections.map((section) => (
					<section key={section.heading} className="mb-4">
						<h2 className="text-sm font-semibold text-black mb-1">{section.heading}</h2>
						<p className="text-sm text-gray-800">{section.body}</p>
					</section>
				))}
			</div>
			<button
				type="button"
				onClick={onBack}
				className="mt-4 text-black hover:text-blue-500 hover:scale-120 text-lg py-1 px-2 rounded-2xl bg-white/80">
				retour
			</button>
		</div>
	)
}

export default LegalView
