import CreateRoomForm from '../../CreateRoomForm'
import BackButton from '../ui/BackButton'
import type { SidebarView } from '../Sidebar'

interface CreateChannelViewProps {
	setView: (view: SidebarView) => void
	userId: number | null
	onCreateChannel: (type: 'channel', memberIds: number[], name?: string, description?: string) => void
}

function CreateChannelView({ setView, userId, onCreateChannel }: CreateChannelViewProps) {
	return (
		<>
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="text-xl font-bold">Nouveau canal</h2>
			</div>
			<CreateRoomForm
				type="channel"
				onCancel={() => setView({kind: 'home'})}
				onCreate={(name, description) => {
					if (userId === null) return
					onCreateChannel('channel', [userId], name, description)
					setView({kind: 'home'})
				}}
			/>
		</>
	)
}

export default CreateChannelView
