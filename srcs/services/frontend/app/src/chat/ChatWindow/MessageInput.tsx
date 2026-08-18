import { useState } from 'react'

interface MessageInputProps {
	onSendMessage: (content: string) => void
	disabled?: boolean
}

function MessageInput({onSendMessage, disabled}: MessageInputProps) {
	const [inputText, setInputText] = useState('')

	function handleSend(e: React.FormEvent) {
		e.preventDefault()
		if (!inputText.trim() || disabled) return

		onSendMessage(inputText.trim())
		setInputText('')
	}

	return (
        <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={disabled ? "Seuls les modérateurs peuvent écrire ici" : "Écris un message..."}
                disabled={disabled}
                className="flex-1 min-w-0 resize-none max-h-40 overflow-y-auto border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
                type="submit"
                disabled={!inputText.trim() || disabled}
                className="btn-primary px-5 rounded-xl text-sm disabled:bg-blue-300 disabled:scale-100 disabled:cursor-not-allowed">
                Envoyer
            </button>
        </form>
    )
}

export default MessageInput
