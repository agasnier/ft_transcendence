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
import { OnlineUsersProvider } from '../hooks/presence'
import InfoPanel from './ChatWindow/InfoPanel'

interface ChatProps {
	onLogout: () => void
	pseudo: string | null
	userId: number | null
	onUpdatePseudo: (newPseudo: string) => Promise<boolean>
}

function Chat({onLogout, pseudo, userId, onUpdatePseudo}: ChatProps) {
	const { channels, createChannel, deleteChannel, addChannel, markChannelRead, setChannelUnread, removeChannel, renameChannel, updateDescription, addMembers, updateChannel, updateWriteMode, updateMemberRole, removeMember } = useChannel()
	const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
	const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? null
	const { messages, createMessage, addMessage } = useMessage(selectedChannelId)
	const [showInfoPanel, setShowInfoPanel] = useState(false)

	const onlineUserIds = useChatSocket(addChannel, removeChannel, updateChannel, addMessage, setChannelUnread, userId, selectedChannelId)

	function handleSelectChannel(id: number) {
		setSelectedChannelId(id)
		markChannelRead(id)
	}

	async function handleSendMessage(content: string) {
		await createMessage(content)
		if (selectedChannelId !== null)
			await markChannelRead(selectedChannelId)
	}

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
		<OnlineUsersProvider value={onlineUserIds}>
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
								onUpdatePseudo={onUpdatePseudo}
								channels={channels}
								selectedChannelId={selectedChannelId}
								onSelectChannel={handleSelectChannel}
								onCreateChannel={createChannel}
							/>
							{selectedChannel && (
								<div className={`flex-1 relative overflow-hidden ${showInfoPanel ? 'pr-90' : ''}`}>
									<ChatWindow
										key={selectedChannel.id}
										channel={selectedChannel}
										userId={userId}
										messages={messages}
										onSendMessage={handleSendMessage}
										onOpenInfoPanel={() => setShowInfoPanel(true)}
									/>
									{showInfoPanel && (
										<InfoPanel
											channel={selectedChannel}
											userId={userId}
											onBack={() => setShowInfoPanel(false)}
											onDeleteChannel={handleDeleteChannel}
											onRenameChannel={renameChannel}
											onUpdateDescription={updateDescription}
											onAddMembers={addMembers}
											onUpdateWriteMode={updateWriteMode}
											onUpdateMemberRole={updateMemberRole}
											onRemoveMember={removeMember}
										/>
									)}
								</div>
							)}
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
		</OnlineUsersProvider>
	)
}

export default Chat
