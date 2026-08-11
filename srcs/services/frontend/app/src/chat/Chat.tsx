import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar/Sidebar'
import ChatWindow from './ChatWindow'
import bg from '../assets/site.webp'
import { useChannel } from '../hooks/useChannel'
import { useMessage } from '../hooks/useMessage'
import { useChatSocket } from '../hooks/useChatSocket'
import { usePresenceSocket } from '../hooks/usePresenceSocket'

interface ChatProps {
	onLogout: () => void
	pseudo: string | null
	userId: number | null
}

function Chat({onLogout, pseudo, userId}: ChatProps) {
	const { channels, createChannel, deleteChannel, addChannel, removeChannel, renameChannel } = useChannel()
	const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
	const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? null
	const { messages, createMessage, addMessage } = useMessage(selectedChannelId)

	useChatSocket(addChannel, removeChannel, addMessage)
	usePresenceSocket()

	async function handleDeleteChannel(id: number) {
		if (!(await deleteChannel(id))) return
		removeChannel(id)
		setSelectedChannelId(null)
	}

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setSelectedChannelId(null)
				;(document.activeElement as HTMLElement)?.blur()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [])

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
							{selectedChannel && 
								<ChatWindow
									key={selectedChannel.id}
									channel={selectedChannel}
									userId={userId}
									messages={messages}
									onSendMessage={createMessage}
									onDeleteChannel={handleDeleteChannel}
									onRenameChannel={renameChannel}
								/>
							}
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default Chat
