import { useState, useEffect, useRef } from 'react'

interface UserMenuProps {
	onLogout: () => void
	pseudo: string | null
}

function UserMenu({onLogout, pseudo}: UserMenuProps) {
	const [menuOpen, setMenuOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!menuOpen)
			return

		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node))
				setMenuOpen(false)
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [menuOpen])

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setMenuOpen((open) => !open)}
				className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-200 rounded-full">
				≡
			</button>
			{menuOpen && (
				<div className="absolute top-full left-0 mt-2 w-48 border rounded-2xl bg-white overflow-hidden gap-2 p-1">
					<button
						className="w-full flex text-left gap-2 px-4 py-2 hover:bg-gray-100 rounded-2xl font-semibold">
						<span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">U</span>
						{pseudo}
					</button>
					<p className="border-t text-gray-200"></p>
					<button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-2xl">Contacts</button>
					<button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-2xl">Paramètres</button>
					<p className="border-t text-gray-200"></p>
					<button
						onClick={onLogout}
						className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 rounded-2xl">
						Déconnexion
					</button>
				</div>
			)}
		</div>
	)
}

export default UserMenu
