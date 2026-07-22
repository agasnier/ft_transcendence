import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import bg from './assets/site.webp'

interface MainAppProp {
	onLogout: () => void
	pseudo: string | null
}

function MainApp({onLogout, pseudo}: MainAppProp) {
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
							<Sidebar onLogout={onLogout} pseudo={pseudo}/>
							<ChatWindow />
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default MainApp
