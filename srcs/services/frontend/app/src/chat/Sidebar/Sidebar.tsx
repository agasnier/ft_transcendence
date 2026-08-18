import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import HomeView from './views/HomeView'
import SearchView from './views/SearchView'
import CreateRoomButton from './ui/CreateRoomButton'
import CreateChannelView from './views/CreateChannelView'
import CreateGroupView from './views/CreateGroupView'
import CreateDiscussionView from './views/CreateDiscussionView'
import UserMenuView from './views/UserMenuView'

interface SidebarProp {
	onLogout: () => void
	pseudo: string | null
	userId: number | null
	role: 'admin' | 'moderator' | 'user' | null
	onUpdatePseudo: (newPseudo: string) => Promise<boolean>
	channels: Channel[]
	selectedChannelId: number | null
	onSelectChannel: (id: number) => void
	onCreateChannel: (type: 'channel' | 'group' | 'discussion', memberIds: number[], name?: string, description?: string) => Promise<Channel | null>
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
	| { kind: 'userMenu' }

const variants = {
	enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
}

function Sidebar({ onLogout, pseudo, userId, role, channels, selectedChannelId, onSelectChannel, onCreateChannel, onUpdatePseudo }: SidebarProp) {
	const [view, setView] = useState<SidebarView>({ kind: 'home' })
	const [activeTab, setActiveTab] = useState<'friends' | 'conversations' | 'admin'>('conversations')
	const [searchQuery, setSearchQuery] = useState('')
	const [direction, setDirection] = useState(1)
	const prevKindRef = useRef<SidebarView['kind']>('home')

	useEffect (() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape')
				navigate({kind: 'home'})
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [view])

	function navigate(next: SidebarView) {
		if (next.kind === view.kind) return
		prevKindRef.current = view.kind
		setDirection(next.kind === 'home' ? -1 : 1)
		setView(next)
	}

	function renderBody() {
		switch (view.kind) {
			case 'home':
				return (
					<HomeView
						userId={userId}
						role={role}
						channels={channels}
						selectedChannelId={selectedChannelId}
						onSelectChannel={onSelectChannel}
						onCreateChannel={onCreateChannel}
						searchQuery={searchQuery}
						setView={navigate}
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
				)
			case 'search':
				return (
					<SearchView
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						setView={navigate}
						userId={userId}
						channels={channels}
						selectedChannelId={selectedChannelId}
						onSelectChannel={onSelectChannel}
						onCreateChannel={onCreateChannel}
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
				)
			case 'createChannel':
				return (
					<CreateChannelView
						setView={navigate}
						userId={userId}
						onCreateChannel={onCreateChannel}
					/>
				)
			case 'createGroup':
				return (
					<CreateGroupView
						setView={navigate}
						userId={userId}
						onCreateChannel={onCreateChannel}
					/>
				)
			case 'createDiscussion':
				return (
					<CreateDiscussionView
						setView={navigate}
						userId={userId}
						onCreateChannel={onCreateChannel}
					/>
				)
			case 'userMenu':
				return (
					<UserMenuView
						setView={navigate}
						onLogout={onLogout}
						pseudo={pseudo}
						onUpdatePseudo={onUpdatePseudo}
					/>
				)
		}
	}

	return (
		<aside className="w-90 shrink-0 shadow-2xl rounded-3xl flex flex-col overflow-y-auto gap-2 p-2 bg-white">
			<div className="flex-1 relative overflow-hidden">
				{(view.kind === 'search' || prevKindRef.current === 'search') ? (
					<div className="absolute inset-0 overflow-y-auto flex flex-col gap-2">
						{renderBody()}
					</div>
				) : (
						<AnimatePresence custom={direction}>
							<motion.div
								key={view.kind}
								custom={direction}
								variants={variants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.2 }}
								className="absolute inset-0 overflow-y-auto flex flex-col gap-2"
							>
								{renderBody()}
							</motion.div>
						</AnimatePresence>
				)}
			</div>
			{view.kind === 'home' && (
				<CreateRoomButton setView={navigate} />
			)}
		</aside>
	)
}

export default Sidebar
