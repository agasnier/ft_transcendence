import { useEffect, useRef, useState } from 'react'

interface MessageInputProps {
	onSendMessage: (content: string) => void
	disabled?: boolean
}

function MessageInput({onSendMessage, disabled}: MessageInputProps) {
	const [inputText, setInputText] = useState('')
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		const el = textareaRef.current
		if (!el) return
		el.style.height = 'auto'
		el.style.height = `${el.scrollHeight}px`
	}, [inputText])

	function handleSend() {
		if (!inputText.trim() || disabled) return

		onSendMessage(inputText.trim())
		setInputText('')
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		handleSend()
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	return (
		<form onSubmit={handleSubmit} className="p-4 border-t bg-white flex gap-2 items-end">
			<textarea
				ref={textareaRef}
				rows={1}
				value={inputText}
				onChange={(e) => setInputText(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={disabled ? "Seuls les modérateurs peuvent écrire ici" : "Écris un message..."}
				disabled={disabled}
				className="flex-1 min-w-0 resize-none max-h-40 overflow-y-auto border border-gray-300 rounded-xl px-4 py-2 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
