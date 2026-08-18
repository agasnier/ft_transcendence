import { useEffect, useRef, useState } from 'react'

interface MessageInputProps {
	onSendMessage: (content: string) => void
	onSendFile: (file: File) => Promise<boolean>
	disabled?: boolean
}

// 10Mo limit
const MAX_FILE_SIZE = 10 * 1024 * 1024

function MessageInput({onSendMessage, onSendFile, disabled}: MessageInputProps) {
	const [inputText, setInputText] = useState('')
	const [isUploading, setIsUploading] = useState(false)
    const [fileError, setFileError] = useState<string | null>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

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

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setFileError(null)

        if (file.size > MAX_FILE_SIZE) {
            setFileError('Fichier trop volumineux (max 10 Mo)')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        setIsUploading(true)
        const ok = await onSendFile(file)
        if (!ok) setFileError('Échec de l\'envoi du fichier')
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

	return (
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white flex flex-col gap-1">
            {fileError && <p className="text-xs text-red-600 px-1">{fileError}</p>}
            <div className="flex gap-2 items-end">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    title="Joindre un fichier"
                    className="icon-button text-xl w-10 h-10 shrink-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? '...' : '📎'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                />
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
            </div>
        </form>
    )
}

export default MessageInput
