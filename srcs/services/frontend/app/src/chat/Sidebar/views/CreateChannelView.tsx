import { useState } from 'react'
import CreateRoomForm from '../ui/CreateRoomForm'
import BackButton from '../ui/BackButton'
import type { SidebarView } from '../Sidebar'

interface CreateChannelViewProps {
	setView: (view: SidebarView) => void
	userId: number | null
	onCreateChannel: (type: 'channel', memberIds: number[], name?: string, description?: string) => Promise<{ id: number } | null>
}

function CreateChannelView({ setView, userId, onCreateChannel }: CreateChannelViewProps) {
	const [error, setError] = useState<string | null>(null)

	return (
		<>
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="text-xl font-bold">Nouveau canal</h2>
			</div>
			<CreateRoomForm
				type="channel"
				onCancel={() => setView({kind: 'home'})}
				onCreate={async (name, description) => {
					if (userId === null) return
					const channel = await onCreateChannel('channel', [userId], name, description)
					if (channel) setView({kind: 'home'})
					else setError('Impossible de créer le canal')
				}}
			/>
			{error && <p className="form-error">{error}</p>}
		</>
	)
}

export default CreateChannelView
