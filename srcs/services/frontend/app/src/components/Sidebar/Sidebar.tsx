import { useState } from 'react'
import HomeView from './HomeView'
import SearchView from './SearchView'

interface SidebarProp {
	onLogout: () => void
	pseudo: string | null
	rooms: Room[]
	selectedRoomId: number | null
	onSelectRoom: (id: number) => void
}

interface Room {
	id: number
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

type SidebarView =
	| { kind: 'home' }
	| { kind: 'search' }

function Sidebar({ onLogout, pseudo, rooms, selectedRoomId, onSelectRoom }: SidebarProp) {
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
						setSearchQuery={setSearchQuery}
						setView={setView}
					/>
				)
			case 'search':
				return (
					<SearchView
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						setView={setView}
					/>
				)
		}
	}

	return (
		<aside className="w-100 shrink-0 shadow-2xl rounded-3xl flex flex-col overflow-y-auto gap-2 p-2 bg-white">
			{renderBody()}
		</aside>
	)
}

export default Sidebar
