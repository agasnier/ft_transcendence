import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import Contacts from './components/Contacts'
import bg from './assets/site.webp'

interface MainAppProp {
	onLogout: () => void
	pseudo: string | null
}

function MainApp({onLogout, pseudo}: MainAppProp) {
	const [view, setView] = useState<'friends' | 'contacts'>('friends')

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={
					<div className="flex flex-col h-screen">
						<img
							src={bg}
							className="absolute inset-0 -z-10 w-full h-full object-cover object-right"
						/>
						<div className="flex flex-1 overflow-hidden p-4 gap-4">
							{view === 'friends' ? (
								<Sidebar
									onLogout={onLogout}
									onSwitchToContacts={() => setView('contacts')}
									pseudo={pseudo}
								/>
							) : (
								<Contacts onBack={() => setView('friends')} />
							)}
								<ChatWindow />
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default MainApp
