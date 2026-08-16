import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar/Sidebar'
import ChatWindow from './ChatWindow/ChatWindow'
import bg from '../assets/site.webp'
import { useChannel } from '../hooks/useChannel'
import { useMessage } from '../hooks/useMessage'
import { useChatSocket } from '../hooks/useChatSocket'
import { usePresenceSocket } from '../hooks/usePresenceSocket'
import InfoPanel from './ChatWindow/InfoPanel'

interface ChatProps {
	onLogout: () => void
	pseudo: string | null
	userId: number | null
}

function Chat({onLogout, pseudo, userId}: ChatProps) {
	const { channels, createChannel, deleteChannel, addChannel, removeChannel, renameChannel, updateChannel } = useChannel()
	const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
	const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? null
	const { messages, createMessage, addMessage } = useMessage(selectedChannelId)
	const [showInfoPanel, setShowInfoPanel] = useState(false)

	useChatSocket(addChannel, removeChannel, updateChannel, addMessage)
	usePresenceSocket()

	async function handleDeleteChannel(id: number) {
		if (!(await deleteChannel(id))) return
		removeChannel(id)
		setSelectedChannelId(null)
	}

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				if (showInfoPanel) {
					setShowInfoPanel(false)
					return
				}
				setSelectedChannelId(null)
				;(document.activeElement as HTMLElement)?.blur()
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [showInfoPanel])

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={
					<div className="flex flex-col h-screen">
						<img
							src={bg}
							className="bg-image"
						/>
						<div className="flex flex-1 overflow-hidden p-4 gap-4">
							<Sidebar
								onLogout={onLogout}
								pseudo={pseudo}
								userId={userId}
								channels={channels}
								selectedChannelId={selectedChannelId}
								onSelectChannel={setSelectedChannelId}
								onCreateChannel={createChannel}
							/>
							{selectedChannel && (
								<div className={`flex-1 relative overflow-hidden ${showInfoPanel ? 'pr-90' : ''}`}>
									<ChatWindow
										key={selectedChannel.id}
										channel={selectedChannel}
										userId={userId}
										messages={messages}
										onSendMessage={createMessage}
										onOpenInfoPanel={() => setShowInfoPanel(true)}
									/>
									{showInfoPanel && (
										<InfoPanel
											channel={selectedChannel}
											onBack={() => setShowInfoPanel(false)}
											onDeleteChannel={handleDeleteChannel}
											onRenameChannel={renameChannel}
										/>
									)}
								</div>
							)}
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default Chat
