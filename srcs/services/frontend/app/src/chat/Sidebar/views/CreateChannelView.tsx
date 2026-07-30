import CreateRoomForm from '../../CreateRoomForm'
import BackButton from '../ui/BackButton'
import type { SidebarView } from '../Sidebar'

interface CreateChannelViewProps {
	setView: (view: SidebarView) => void
	onCreateChannel: (name: string, description: string, type: 'channel') => void
}

function CreateChannelView({ setView, onCreateChannel }: CreateChannelViewProps) {
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
					onCreateChannel(name, description, 'channel');
					setView({kind: 'home'})
				}}
			/>
		</>
	)
}

export default CreateChannelView
