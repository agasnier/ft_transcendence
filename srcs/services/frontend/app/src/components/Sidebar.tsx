import UserMenu from './UserMenu'

interface SidebarProp {
	onLogout: () => void
	pseudo: string | null
}

function Sidebar({onLogout, pseudo}: SidebarProp) {
	return (
		<aside className="w-80 shrink-0 shadow-2xl rounded-3xl bg-white flex flex-col overflow-y-auto gap-2 p-2">
			<div
				className="flex items-center justify-between">
				<UserMenu onLogout={onLogout} pseudo={pseudo}/>
			</div>
			<div className="bg-gray-100 rounded-3xl p-4">
				<h2 className="font-semibold text-gray-700 mb-2">Amis</h2>
				<p className="text-sm text-gray-400">Aucun ami</p>
			</div>
			<div className="bg-gray-100 rounded-3xl p-4">
				<h2 className="font-semibold text-gray-700 mb-2">Conversations</h2>
				<p className="text-sm text-gray-400">Aucune conversation</p>
			</div>
			<button
				className="mt-auto self-end bg-blue-500 text-white font-bold w-12 h-12 rounded-full hover:bg-blue-600 flex items-center justify-center text-2xl"title="Créer un salon">
				+
			</button>
		</aside>
	)
}

export default Sidebar
