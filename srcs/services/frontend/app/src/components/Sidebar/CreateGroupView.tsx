import type { SidebarView } from './Sidebar'

interface CreateGroupViewProps {
	setView: (view: SidebarView) => void
	onCreateRoom: (name: string, description: string, type: 'group') => void
}

function CreateGroupView({}: CreateGroupViewProps) {
	return null
}

export default CreateGroupView
