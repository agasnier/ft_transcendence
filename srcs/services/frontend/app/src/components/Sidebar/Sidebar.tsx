import { useState } from 'react'
import HomeView from './views/HomeView'
import SearchView from './views/SearchView'
import CreateRoomButton from './ui/CreateRoomButton'
import CreateChannelView from './views/CreateChannelView'
import CreateGroupView from './views/CreateGroupView'
import CreateDiscussionView from './views/CreateDiscussionView'

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
					<CreateChannelView
						setView={setView}
						onCreateRoom={onCreateRoom}
					/>
				)
			case 'createGroup':
				return (
					<CreateGroupView
						setView={setView}
						onCreateRoom={onCreateRoom}
					/>
				)
			case 'createDiscussion':
				return (
					<CreateDiscussionView
						setView={setView}
						onCreateRoom={onCreateRoom}
					/>
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
