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
	userId: number | null
	channels: Channel[]
	selectedChannelId: number | null
	onSelectChannel: (id: number) => void
	onCreateChannel: (type: 'channel' | 'group' | 'discussion', memberIds: number[], name?: string, description?: string) => void
}

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

export type SidebarView =
	| { kind: 'home' }
	| { kind: 'search' }
	| { kind: 'createChannel' }
	| { kind: 'createGroup' }
	| { kind: 'createDiscussion' }

function Sidebar({ onLogout, pseudo, userId, channels, selectedChannelId, onSelectChannel, onCreateChannel }: SidebarProp) {
	const [view, setView] = useState<SidebarView>({ kind: 'home' })
	const [searchQuery, setSearchQuery] = useState('')

	function renderBody() {
		switch (view.kind) {
			case 'home':
				return (
					<HomeView
						onLogout={onLogout}
						pseudo={pseudo}
						channels={channels}
						selectedChannelId={selectedChannelId}
						onSelectChannel={onSelectChannel}
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
						channels={channels}
						selectedChannelId={selectedChannelId}
						onSelectChannel={onSelectChannel}
					/>
				)
			case 'createChannel':
				return (
					<CreateChannelView
						setView={setView}
						userId={userId}
						onCreateChannel={onCreateChannel}
					/>
				)
			case 'createGroup':
				return (
					<CreateGroupView
						setView={setView}
					/>
				)
			case 'createDiscussion':
				return (
					<CreateDiscussionView
						setView={setView}
						userId={userId}
						onCreateChannel={onCreateChannel}
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
