import { useState } from 'react'
import UserMenu from './UserMenu'
import FriendsPanel from './FriendsPanel'
import ConversationsPanel from './ConversationsPanel'

interface SidebarProp {
	onLogout: () => void
	pseudo: string | null
}

function Sidebar({onLogout, pseudo}: SidebarProp) {
	const [activeTab, setActiveTab] = useState<'friends' | 'conversations'>('conversations')
	const [searchQuery, setSearchQuery] = useState('')

	return (
		<aside className="w-80 shrink-0 shadow-2xl rounded-3xl bg-white flex flex-col overflow-y-auto gap-2 p-2">
			<div
				className="flex items-center gap-2">
				<UserMenu
					onLogout={onLogout}
					pseudo={pseudo}/>
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="🔍︎ Rechercher"
					onKeyDown={(e) => {
						if (e.key === 'Escape')
							e.currentTarget.blur()
					}}
					className="flex-1 min-w-0 text-lg bg-gray-100 rounded-full px-3 py-2 border border-transparent hover:border hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
				/>
			</div>
			<div
				className="flex bg-gray-100 rounded-full p-1 gap-1">
				<button
					type="button"
					onClick={() => setActiveTab('conversations')}
					className={`flex-1 text-lg font-medium py-2 rounded-full transition-colors hover:text-blue-500 ${activeTab === 'conversations' ? 'bg-blue-100 text-blue-500' : ''}`}>
					Conversations
				</button>
				<button
					type="button"
					onClick={() => setActiveTab('friends')}
					className={`flex-1 text-lg font-medium py-2 rounded-full transition-colors hover:text-blue-500 ${activeTab === 'friends' ? 'bg-blue-100 text-blue-500 hover:none' : ''}`}>
					Amis
				</button>
			</div>
			{activeTab === 'friends' && <FriendsPanel searchQuery={searchQuery} />}
			{activeTab === 'conversations' && <ConversationsPanel />}
			<button
				className="mt-auto self-end bg-blue-500 text-white font-bold w-12 h-12 rounded-full hover:bg-blue-600 flex items-center justify-center text-2xl"title="Créer un salon">
				+
			</button>
		</aside>
	)
}

export default Sidebar
