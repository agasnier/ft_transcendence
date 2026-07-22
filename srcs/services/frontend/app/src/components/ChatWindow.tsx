function ChatWindow() {
	return (
		<main className="flex-1 flex flex-col">
			<div className="flex-1 flex items-center justify-center text-black">
				Sélectionne une conversation
			</div>
			<div className="p-4 border-t flex gap-2">
				<input
					disabled
					placeholder="Écris un message..."
					className="flex-1 border rounded-md px-3 py-2"
				/>
				<button
					disabled
					className="bg-blue-600 text-white px-4 py-2 rounded-md">
					Envoyer
				</button>
			</div>
		</main>
	)
}

export default ChatWindow
