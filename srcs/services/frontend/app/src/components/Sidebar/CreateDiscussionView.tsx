import type { SidebarView } from './Sidebar'
import BackButton from './BackButton'

interface CreateDiscussionViewProps {
	setView: (view: SidebarView) => void
	onCreateRoom: (name: string, description: string, type: 'discussion') => void
}

function CreateDiscussionView({ setView }: CreateDiscussionViewProps) {
	return (
		<div className="flex items-center gap-2">
			<BackButton onClick={() => setView({ kind: 'home' })} />
			<h2 className="text-xl font-bold">Nouvelle discussion</h2>
		</div>
	)
}

export default CreateDiscussionView
