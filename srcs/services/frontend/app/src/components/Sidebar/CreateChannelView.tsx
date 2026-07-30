import CreateRoomForm from '../CreateRoomForm'
import type { SidebarView } from './Sidebar'

interface CreateChannelViewProps {
	setView: (view: SidebarView) => void
	onCreateRoom: (name: string, description: string, type: 'channel') => void
}

function CreateChannelView({ setView, onCreateRoom }: CreateChannelViewProps) {
	return (
		<>
			<button
				onClick={() => setView({ kind: 'home' })}
				className="text-blue-500 hover:underline">
				return
			</button>
			<CreateRoomForm
				type="channel"
				onCancel={() => setView({kind: 'home'})}
				onCreate={(name, description) => {
					onCreateRoom(name, description, 'channel');
					setView({kind: 'home'})
				}}
			/>
		</>
	)
}

export default CreateChannelView
