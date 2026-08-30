import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar/Sidebar'
import ChatWindow from './ChatWindow/ChatWindow'
import InfoPanel from './InfoPanel/InfoPanel'
import bg from '../assets/site.webp'
import { useChannel } from '../hooks/useChannel'
import { useMessage } from '../hooks/useMessage'
import { useChatSocket } from '../hooks/useChatSocket'
import { OnlineUsersProvider, UserAvatarsProvider } from '../hooks/presence'
import { useIsWide } from '../hooks/useIsWide'
import { AnimatePresence, motion } from 'motion/react'

const variants = {
	enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0}),
	center: { x: 0, opacity: 1},
	exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0}),
}

type ChatMobileView = 'sidebar' | 'chat'

interface ChatProps {
	onLogout: () => void
	pseudo: string | null
	userId: number | null
	role: 'admin' | 'moderator' | 'user' | null
	onUpdatePseudo: (newPseudo: string) => Promise<boolean>
}

function Chat({onLogout, pseudo, userId, role, onUpdatePseudo}: ChatProps) {
	const { channels, createChannel, deleteChannel, addChannel, markChannelRead, setChannelUnread, removeChannel, renameChannel, updateDescription, addMembers, updateChannel, updateWriteMode, updateMemberRole, removeMember, uploadChannelAvatar, deleteChannelAvatar } = useChannel()
	const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null)
	const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? null
	const { messages, createMessage, uploadFile, addMessage, editMessage, deleteMessage, updateMessage, removeMessage } = useMessage(selectedChannelId)
	const [showInfoPanel, setShowInfoPanel] = useState(false)
	const { onlineUserIds, userAvatars } = useChatSocket(addChannel, removeChannel, updateChannel, addMessage, setChannelUnread, userId, selectedChannelId, updateMessage, removeMessage)
	const isWide = useIsWide()
	const [mobileView, setMobileView] = useState<ChatMobileView>('sidebar')
	const [direction, setDirection] = useState(1)

	function navigate(view: ChatMobileView) {
		setDirection(view === 'sidebar' ? -1 : 1)
		setMobileView(view)
	}

	function handleSelectChannel(id: number) {
		setSelectedChannelId(id)
		markChannelRead(id)
		navigate('chat')
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
				navigate('sidebar')
				;(document.activeElement as HTMLElement)?.blur()
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [showInfoPanel])

	useEffect(() => {
		if (!isWide)
			setShowInfoPanel(false)
	}, [isWide])

	// If channel displayed disappear (deleted, or removed by moderator/admin), unselect it
	useEffect(() => {
		if (selectedChannelId !== null && !channels.some((c) => c.id === selectedChannelId)) {
			setSelectedChannelId(null)
			setShowInfoPanel(false)
		}
	}, [channels, selectedChannelId])

	const sidebarBlock = (
		<Sidebar
			onLogout={onLogout}
			pseudo={pseudo}
			userId={userId}
			role={role}
			onUpdatePseudo={onUpdatePseudo}
			channels={channels}
			selectedChannelId={selectedChannelId}
			onSelectChannel={handleSelectChannel}
			onCreateChannel={createChannel}
		/>
	)

	const chatWindowBlock = selectedChannel && (
		<ChatWindow
			key={selectedChannel.id}
			channel={selectedChannel}
			userId={userId}
			role={role}
			messages={messages}
			onSendMessage={handleSendMessage}
			onSendFile={uploadFile}
			onEditMessage={editMessage}
			onDeleteMessage={deleteMessage}
			onOpenInfoPanel={() => setShowInfoPanel(true)}
			onBack={!isWide ? () => navigate('sidebar') : undefined}
		/>
	)

	const infoPanelBlock = showInfoPanel && selectedChannel && (
		<motion.div
			key="info"
			initial={{ x: 360 }}
			animate={{ x: 0 }}
			exit={{ x: 360 }}
			transition={{ duration: 0.2 }}
			className="absolute top-0 right-0 bottom-0 w-90"
		>
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
				onUploadAvatar={uploadChannelAvatar}
				onDeleteAvatar={deleteChannelAvatar}
			/>
		</motion.div>
	)

	return (
		<UserAvatarsProvider value={userAvatars}>
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
							{isWide ? (
								<>
									{sidebarBlock}
									{selectedChannel && (
										<div className="flex-1 relative">
											{chatWindowBlock}
										</div>
									)}
									<div className={`shrink-0 relative overflow-hidden transition-all duration-200 ${showInfoPanel ? 'w-90' : 'w-0'}`}>
										<AnimatePresence>
											{infoPanelBlock}
										</AnimatePresence>
									</div>
								</>
							) : (
								<div className="flex-1 relative overflow-hidden">
									<AnimatePresence custom={direction}>
										<motion.div
											key={mobileView === 'sidebar' ? 'sidebar' : 'chat'}
											custom={direction}
											variants={variants}
											initial="enter"
											animate="center"
											exit="exit"
											transition={{ duration: 0.2 }}
											className="absolute inset-0"
										>
											{mobileView === 'sidebar' ? sidebarBlock : (
												selectedChannel && (
													<div className="relative w-full h-full">
														{chatWindowBlock}
														<AnimatePresence>
															{infoPanelBlock}
														</AnimatePresence>
													</div>
												)
											)}
										</motion.div>
									</AnimatePresence>
								</div>
							)
							}
						</div>
					</div>}
				/>
			</Routes>
		</BrowserRouter>
		</OnlineUsersProvider>
		</UserAvatarsProvider>
	)
}

export default Chat
