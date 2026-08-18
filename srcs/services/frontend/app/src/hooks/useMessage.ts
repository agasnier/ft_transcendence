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

	async function uploadFile(file: File, onProgress?: (percent: number) => void): Promise<boolean> {
    if (channelId === null) return false

    return new Promise((resolve) => {
        const formData = new FormData()
        formData.append('file', file)

        const xhr = new XMLHttpRequest()
        xhr.open('POST', `/chat/files/${channelId}`)

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100)
                onProgress(percent)
            }
        }

        xhr.onload = () => {
            resolve(xhr.status >= 200 && xhr.status < 300)
        }

        xhr.onerror = () => {
            resolve(false)
        }

        xhr.send(formData)
    })
}

	function addMessage(message: Message) {
		if (channelId === null || message.channelId !== channelId) return
		setMessages((prev) =>
			prev.some((m) => m.id === message.id)
				? prev
				: [...prev, message]
		)
	}

	async function editMessage(messageId: number, content: string): Promise<boolean> {
    if (channelId === null) return false
    const res = await fetch(`/chat/channels/${channelId}/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content }),
    })
    return res.ok
	}

	async function deleteMessage(messageId: number): Promise<boolean> {
		if (channelId === null) return false
		const res = await fetch(`/chat/channels/${channelId}/messages/${messageId}`, {
			method: 'DELETE',
		})
		return res.ok
	}

	function updateMessage(message: Message) {
    if (channelId === null || message.channelId !== channelId) return
    setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)))
	}

	function removeMessage(messageId: number) {
		setMessages((prev) => prev.filter((m) => m.id !== messageId))
	}

	return {
		messages,
		createMessage,
		uploadFile,
		addMessage,
		editMessage,
		deleteMessage,
		updateMessage,
		removeMessage,
	}
}
