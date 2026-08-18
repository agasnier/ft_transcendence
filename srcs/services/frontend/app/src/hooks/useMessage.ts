import { useState, useEffect } from 'react'

interface FileInfo {
    id: number
    originalName: string
    mimeType: string
    size: number
}

interface Message {
	id: number
	channelId: number
	senderId: number
	senderPseudo: string | null
	content: string
	createdAt: string
	type: 'user' | 'system'
	fileId: number | null
    file: FileInfo | null
}

export function useMessage(channelId: number | null) {
	const [messages, setMessages] = useState<Message[]>([])

	// load messages when selected channel changes
	useEffect(() => {
		if (channelId === null) {
			setMessages([])
			return
		}
		async function loadMessages() {
			const res = await fetch(`/chat/channels/${channelId}/messages`)
			if (!res.ok)
				return
			setMessages(await res.json())
		}
		loadMessages()
	}, [channelId])

	async function createMessage(content: string) {
	if (channelId === null) return
	await fetch(`/chat/channels/${channelId}/messages`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ content }),
	})
	}

	async function uploadFile(file: File): Promise<boolean> {
        if (channelId === null) return false
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`/chat/files/${channelId}`, {
            method: 'POST',
            body: formData,
        })
        return res.ok
    }

	function addMessage(message: Message) {
		if (channelId === null || message.channelId !== channelId) return
		setMessages((prev) =>
			prev.some((m) => m.id === message.id)
				? prev
				: [...prev, message]
		)
	}

	return {
		messages,
		createMessage,
		uploadFile,
		addMessage,
	}
}
