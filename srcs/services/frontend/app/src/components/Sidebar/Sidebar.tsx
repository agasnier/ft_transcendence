import { useState } from 'react'
import HomeView from './HomeView'
import SearchView from './SearchView'
import CreateRoomButton from './CreateRoomButton'
import CreateRoomForm from '../CreateRoomForm'

interface SidebarProp {
	onLogout: () => void
	pseudo: string | null
	rooms: Room[]
	selectedRoomId: number | null
	onSelectRoom: (id: number) => void
	onCreateRoom: (name: string, description: string, type: 'channel' | 'group' | 'discussion') => void
}

interface Room {
	id: number
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

export type SidebarView =
	| { kind: 'home' }
	| { kind: 'search' }
	| { kind: 'createChannel' }
	| { kind: 'createGroup' }
	| { kind: 'createDiscussion' }

function Sidebar({ onLogout, pseudo, rooms, selectedRoomId, onSelectRoom, onCreateRoom }: SidebarProp) {
	const [view, setView] = useState<SidebarView>({ kind: 'home' })
	const [searchQuery, setSearchQuery] = useState('')

	function renderBody() {
		switch (view.kind) {
			case 'home':
				return (
					<HomeView
						onLogout={onLogout}
						pseudo={pseudo}
						rooms={rooms}
						selectedRoomId={selectedRoomId}
						onSelectRoom={onSelectRoom}
						searchQuery={searchQuery}
						setView={setView}
					/>
				)
			case 'search':
				return (
					<SearchView
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						setView={setView}
						rooms={rooms}
						selectedRoomId={selectedRoomId}
						onSelectRoom={onSelectRoom}
					/>
				)
			case 'createChannel':
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
			case 'createGroup':
				return (
					<button
						onClick={() => setView({ kind: 'home' })}
						className="text-blue-500 hover:underline">
						return
					</button>
				)
			case 'createDiscussion':
				return (
					<button
						onClick={() => setView({ kind: 'home' })}
						className="text-blue-500 hover:underline">
						return
					</button>
				)
		}
	}

	return (
		<aside className="w-90 shrink-0 shadow-2xl rounded-3xl flex flex-col overflow-y-auto gap-2 p-2 bg-white">
			<div className="flex-1 overflow-y-auto flex flex-col gap-2">
				{renderBody()}
			</div>
			{view.kind === 'home' && (
				<CreateRoomButton setView={setView} />
			)}
		</aside>
	)
}

export default Sidebar
