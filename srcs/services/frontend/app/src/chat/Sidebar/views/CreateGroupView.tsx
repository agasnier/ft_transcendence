import type { SidebarView } from '../Sidebar'
import BackButton from '../ui/BackButton'

interface CreateGroupViewProps {
	setView: (view: SidebarView) => void
	onCreateChannel: (name: string, description: string, type: 'group') => void
}

function CreateGroupView({ setView }: CreateGroupViewProps) {
	return (
		<div className="flex items-center gap-2">
			<BackButton onClick={() => setView({ kind: 'home' })} />
			<h2 className="text-xl font-bold">Nouveau groupe</h2>
		</div>
	)
}

export default CreateGroupView
