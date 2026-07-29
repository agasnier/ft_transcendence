import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '../context/WebSocketContext'

interface ChatWindowProps {
	room: Room
	userId: number | null
}

interface Message {
	id: string
	senderId: number | null
	text: string
	timestamp: string
	senderPseudo: string
}

interface Room {
	id: number
	name: string
	description: string
	type: 'channel' | 'group' | 'discussion'
}

function ChatWindow({room, userId}: ChatWindowProps) {
	const { isConnected, lastMessage, sendMessage } = useWebSocket()
	const [messages, setMessages] = useState<Message[]>([])
	const [inputText, setInputText] = useState('')
	const messagesEndRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!lastMessage) return

		if (lastMessage.type === 'NEW_CHAT_MESSAGE' && lastMessage.payload) {
			const newMessage: Message = {
				id: Math.random().toString(36).substring(2, 9),
				senderId: lastMessage.payload.senderId ?? null,
				text: lastMessage.payload.text ?? '',
				timestamp: lastMessage.payload.timestamp ?? new Date().toISOString(),
				senderPseudo: lastMessage.payload.senderPseudo ?? ''
			}
			setMessages((prev) => [...prev, newMessage])
		}
	}, [lastMessage])

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// TODO delete after websocket message working
	useEffect(() => {
		setMessages([
			{ id: '1', senderId: userId, text: 'moi messageeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', timestamp: new Date().toISOString(), senderPseudo: 'Moi' },
			{ id: '2', senderId: 2, text: "autre messagewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", timestamp: new Date().toISOString(), senderPseudo: 'Autre' },
		])
	}, [])

	function handleSend(e: React.FormEvent) {
		e.preventDefault()
		if (!inputText.trim() || !isConnected) return

		sendMessage('CHAT_MESSAGE', { text: inputText.trim() })
		setInputText('')
	}

	return (
		<main className="flex-1 flex flex-col bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
			{/* Chat Header */}
			<div className="p-4 border-b bg-white/50 flex items-center justify-between">
				<h1 className="font-bold text-gray-800 text-lg">{room.name}</h1>
				<div className="flex items-center gap-2 text-xs font-semibold">
					<span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
					<span className={isConnected ? 'text-green-600' : 'text-red-500'}>
						{isConnected ? 'Connecté' : 'Hors ligne (Reconnexion...)'}
					</span>
				</div>
			</div>

			{/* Messages Container */}
			<div className="flex-1 p-4 overflow-y-auto space-y-3">
				{messages.length === 0 ? (
					<div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
						{isConnected ? 'Aucun message pour l\'instant. Commencez la discussion !' : 'Connexion au serveur de chat...'}
					</div>
				) : (
					messages.map((msg) => {
						const isOwn = msg.senderId !== null && msg.senderId === userId
						return (
							<div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
								<div className={`flex flex-col min-w-0 p-3 rounded-2xl max-w-md shadow-sm
									${isOwn
									? 'items-end bg-blue-200'
									: 'items-start bg-white border-blue-100'}
								`}>
									<div className="flex justify-between w-full text-xs font-semibold text-blue-700 mb-1 gap-4">
										<span>{msg.senderPseudo || `Utilisateur #${msg.senderId}`}</span>
										<span className="text-gray-400 font-normal">
											{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</span>
									</div>
									<p className="text-gray-800 text-sm font-light wrap-break-word min-w-0 w-full">{msg.text}</p>
								</div>
							</div>
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
					disabled={!isConnected}
					placeholder={isConnected ? 'Écris un message...' : 'Connexion en cours...'}
					className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
				<button
					type="submit"
					disabled={!isConnected || !inputText.trim()}
					className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors hover:scale-105 disabled:bg-blue-300 disabled:scale-100 disabled:cursor-not-allowed">
					Envoyer
				</button>
			</form>
		</main>
	)
}

export default ChatWindow
