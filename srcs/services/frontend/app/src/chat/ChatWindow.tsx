import { useState, useEffect, useRef, Fragment } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'

interface ChatWindowProps {
	channel: Channel
	userId: number | null
	messages: Message[]
	onSendMessage: (content: string) => void
	onDeleteChannel: (id: number) => void
	onRenameChannel: (id: number, name: string) => Promise<boolean>
}

interface Message {
	id: number
	channelId: number
	senderId: number
	senderPseudo: string | null
	content: string
	createdAt: string
	type: 'user' | 'system'
}

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
}

function ChatWindow({ channel, userId, messages, onSendMessage, onDeleteChannel, onRenameChannel }: ChatWindowProps) {
	const [inputText, setInputText] = useState('')
	const [optionMenu, setOptionMenu] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const [isEditingName, setIsEditingName] = useState(false)
	const [nameInput, setNameInput] = useState(channel.name ?? '')

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	useClickOutside(optionMenu, '[data-menu-popover]', () => setOptionMenu(false))

	function handleSend(e: React.FormEvent) {
		e.preventDefault()
		if (!inputText.trim()) return

		onSendMessage(inputText.trim())
		setInputText('')
	}

	async function handleRename(e: React.FormEvent) {
		e.preventDefault()
		if (!nameInput.trim())
			return
		const ok = await onRenameChannel(channel.id, nameInput.trim())
		if (ok)
			setIsEditingName(false)
	}

	return (
		<main className="flex-1 flex flex-col bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
			{/* Chat Header */}
			<div className="flex p-1 border-b bg-white/50 items-center justify-between">
				<div className="flex items-center gap-4 min-w-0">
					<span
						className="avatar-circle bg-orange-400 font-thin w-10 h-10">
						{channel.name?.charAt(0).toUpperCase()}
					</span>
					<div className="flex flex-col min-w-0">
						{isEditingName ? (
							<form onSubmit={handleRename}>
								<input
									autoFocus
									value={nameInput}
									onChange={(e) => setNameInput(e.target.value)}
									onBlur={() => setIsEditingName(false)}
									maxLength={255}
									className="font-bold text-gray-800 text-lg border-b border-blue-400 focus:outline-none"
									/>
							</form>
						) : (
							<h1 className="font-bold text-gray-800 text-lg truncate">{channel.name}</h1>
						)}
						<span className="text-black/50 truncate"> {/*TODO*/}
							{/* si discussion => en ligne ou hors ligne,
							si group => nombre de membres,
							si canal => nombre d'abonnés */}
							{channel.type === 'discussion' && (
								<span>En ligne ou hors ligne</span>
							)}
							{channel.type !== 'discussion' && (
								<span>nombre d'abonnés ou membres{(channel.name) !== null ? '' : 'ok'}</span>
							)}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-3 shrink-0">
					<span data-menu-popover className="relative">
						<button
							type="button"
							onClick={() => setOptionMenu((prev) => !prev)}
							title="Menu"
							className="icon-button text-2xl text-right font-bold text-gray-600 w-10 h-10">
							⋮
						</button>
						{optionMenu && (
							<div className="absolute z-20 top-full right-0 mt-2 w-58 bg-white border rounded-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.15)] p-1">
								{channel.type !== 'discussion' && <button
									type="button"
									onClick={() => {
										setOptionMenu(false)
									}}
									className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-xl">
									{channel.type === 'group' ? '👥​ Membres' : '👥​ Abonnés'}
								</button>}
								{channel.type !== 'discussion' && <button
									type="button"
									onClick={() => {
										setNameInput(channel.name ?? '')
										setIsEditingName(true)
										setOptionMenu(false)
									}}
									className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-xl">
									🖊️​ Renommer le channel
								</button>}
								<button
									type="button"
									onClick={() => {
										onDeleteChannel(channel.id)
										setOptionMenu(false)
									}}
									className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl">
									🗑️​ Supprimer la conversation
								</button>
							</div>
						)}
					</span>
				</div>
			</div>

			{/* Messages Container */}
			<div className="flex-1 p-4 overflow-y-auto space-y-3">
				{messages.length === 0 ? (
					<div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
						Aucun message pour l'instant. Commencez la discussion !
					</div>
				) : (
					messages.map((msg, index) => {
						const msgDay = new Date(msg.createdAt).toDateString()
						const prevDay = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null
						const showDateDivider = msgDay !== prevDay
						const isOwn = msg.senderId === userId
						const content = msg.type === 'system' ? (
							<div className="flex flex-col items-center justify-center gap-2">
								<span className="text-xs text-white bg-blue-400 rounded-2xl p-1">
									{channel.type === 'group' && (
										<span className="font-bold">
											{msg.senderPseudo ?? `Utilisateur #${msg.senderId}`}
										</span>
									)}
									{msg.content}
								</span>
							</div>
						) : (
							<div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
								<div className={`flex flex-col min-w-0 p-3 rounded-2xl max-w-md shadow-sm
									${isOwn
									? 'items-end bg-blue-200/50'
									: 'items-start bg-white border-blue-100'}
								`}>
									<div className="flex justify-between w-full text-sm font-semibold text-blue-700 mb-1 gap-4">
										<span>{msg.senderPseudo ?? `Utilisateur #${msg.senderId}`}</span>
										<span className="text-blue-500 font-normal">
											{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</span>
									</div>
									<p className="text-gray-800 wrap-break-word min-w-0 w-full">{msg.content}</p>
								</div>
							</div>
						)
						return (
							<Fragment key={msg.id}>
								{showDateDivider && (
									<div className="flex justify-center">
										<span className="text-xs text-gray-400">
											{new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
										</span>
									</div>
								)}
								{content}
							</Fragment>
						)
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Message Input Form */}
			<form onSubmit={handleSend} className="p-4 border-t bg-white/60 flex gap-2">
				<input
					type="text"
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					placeholder="Écris un message..."
					className="flex-1 min-w-0 resize-none max-h-40 overflow-y-auto border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					type="submit"
					disabled={!inputText.trim()}
					className="btn-primary px-5 rounded-xl text-sm disabled:bg-blue-300 disabled:scale-100 disabled:cursor-not-allowed">
					Envoyer
				</button>
			</form>
		</main>
	)
}

export default ChatWindow
