import BackButton from '../ui/BackButton'
import ApiKeySection from '../ui/ApiKeySection'
import TwoFactorSection from '../ui/TwoFactorSection'
import type { SidebarView } from '../Sidebar'

interface UserMenuViewProps {
	setView: (view: SidebarView) => void
	onLogout: () => void
	pseudo: string | null
}

function UserMenuView({ setView, onLogout, pseudo }: UserMenuViewProps) {
	return (
		<div className="flex flex-col gap-2 h-full min-h-0">
			<div className="flex items-center gap-2">
				<BackButton onClick={() => setView({ kind: 'home' })} />
				<h2 className="text-xl font-bold">Paramètres</h2>
			</div>
			<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
				<div className="flex flex-col items-center gap-2 font-semibold text-gray-800 py-2">
					<span
						className="avatar-circle bg-blue-500 w-30 h-30 text-6xl">
						{pseudo?.charAt(0).toUpperCase() ?? '?'}
					</span>
					<span className="truncate text-2xl">{pseudo ?? 'Utilisateur'}</span>
				</div>
				<p className="border-t text-gray-200 my-1"></p>
				<ApiKeySection />
				<p className="border-t text-gray-200 my-1"></p>
				<TwoFactorSection />
				<p className="border-t text-gray-200 my-1"></p>
				<button
					onClick={onLogout}
					className="menu-item text-red-600 hover:bg-red-100">
					Déconnexion
				</button>
			</div>
		</div>
	)
}

export default UserMenuView
