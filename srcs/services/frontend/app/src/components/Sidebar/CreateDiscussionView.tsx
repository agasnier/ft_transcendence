import type { SidebarView } from './Sidebar'

interface CreateDiscussionViewProps {
	setView: (view: SidebarView) => void
	onCreateRoom: (name: string, description: string, type: 'discussion') => void
}

function CreateDiscussionView({}: CreateDiscussionViewProps) {
	return null
}

export default CreateDiscussionView
