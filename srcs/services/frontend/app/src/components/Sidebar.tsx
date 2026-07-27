import { useState, useEffect } from 'react'
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
	const [isSearching, setIsSearching] = useState(false)
	const [searchScope, setSearchScope] = useState<'conversations' | 'friends'>('conversations')
	const visiblePanel = isSearching ? searchScope : activeTab

	useEffect(() => {
		if (!isSearching)
			return

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setIsSearching(false)
				setSearchQuery('')
				;(document.activeElement as HTMLElement)?.blur()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [isSearching])

	return (
		<aside className={`w-80 shrink-0 shadow-2xl rounded-3xl flex flex-col overflow-y-auto gap-2 p-2 ${isSearching ? 'bg-gray-100' : 'bg-white'}`}>
			<div
				className="flex items-center gap-2">
				{isSearching ? (
					<button
						type="button"
						onClick={() => { setIsSearching(false); setSearchQuery('') }}
						className="w-12 h-12 bg-white text-2xl text-gray-500 leading-none flex items-center justify-center hover:bg-gray-200 rounded-full">
						⟲
					</button>
				) : (
					<UserMenu
						onLogout={onLogout}
						pseudo={pseudo}/>
				)}
				<div className="relative flex-1 min-w-0">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="🔍︎ Rechercher"
						onFocus={() => {
							if (!isSearching)
								setSearchScope('conversations')
							setIsSearching(true)
						}}
						className={`w-full text-lg rounded-full pl-3 pr-9 py-2 border border-transparent hover:border hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white ${isSearching ? 'bg-white' : 'bg-gray-100'}`}
					/>
					{searchQuery !== '' && (
						<button
							type="button"
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => setSearchQuery('')}
							className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-100">
							✕
						</button>
					)}
				</div>
			</div>
			{isSearching ? (
			<div
				className="flex bg-white rounded-full p-1 gap-1">
				<button
					type="button"
					onClick={() => setSearchScope('conversations')}
					className={`flex-1 text-lg font-medium py-2 rounded-full transition-colors hover:text-blue-500 ${searchScope === 'conversations' ? 'bg-blue-100 text-blue-500' : ''}`}>
					Conv
				</button>
				<button
					type="button"
					onClick={() => setSearchScope('friends')}
					className={`flex-1 text-lg font-medium py-2 rounded-full transition-colors hover:text-blue-500 ${searchScope === 'friends' ? 'bg-blue-100 text-blue-500' : ''}`}>
					User
				</button>
			</div>
			) : (
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
			)}
			{visiblePanel === 'friends' && (!isSearching || searchQuery.trim() !== '') && <FriendsPanel searchQuery={searchQuery} isSearching={isSearching} />}
			{visiblePanel === 'conversations' && (!isSearching || searchQuery.trim() !== '') && <ConversationsPanel isSearching={isSearching} />}
			{!isSearching && (
				<button
					className="mt-auto self-end bg-blue-500 text-white font-bold w-12 h-12 rounded-full hover:bg-blue-600 flex items-center justify-center text-2xl"title="Créer un salon">
					+
				</button>
			)}
		</aside>
	)
}

export default Sidebar
