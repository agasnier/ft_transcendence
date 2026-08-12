import { useState, useEffect } from 'react'

interface Message {
	id: number
	channelId: number
	senderId: number
	senderPseudo: string | null
	content: string
	createdAt: string
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
		addMessage,
	}
}
