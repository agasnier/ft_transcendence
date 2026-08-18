import { useState, useEffect } from 'react'

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
	memberIds?: number[]
	otherUserId?: number
    writeMode?: 'everyone' | 'moderators_only'
}

export function useChannel() {
	const [channels, setChannels] = useState<Channel[]>([])

	// load the channel list on startup
	useEffect(() => {
		async function loadChannels() {
			const res = await fetch('/chat/channels')
			if (!res.ok)
				return
			setChannels(await res.json())
		}
		loadChannels()
	}, [])

	async function createChannel(
		type: Channel['type'],
		memberIds: number[],
		name?: string,
		description?: string,
	): Promise<Channel | null> {
		const res = await fetch('/chat/channels', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ type, memberIds, name, description }),
		})
		if (!res.ok) return null
		const channel = await res.json()
		addChannel(channel)
		return channel
	}

	async function deleteChannel(id: number): Promise<boolean> {
		const res = await fetch(`/chat/channels/${id}`, { method: 'DELETE' })
		return res.ok
	}

	function addChannel(channel: Channel) {
		setChannels((prev) =>
			prev.some((c) => c.id === channel.id)
				? prev
				: [...prev, channel]
		)
	}

	function removeChannel(id: number) {
		setChannels((prev) => prev.filter((c) => c.id !== id))
	}

	function updateChannel(channel: Channel) {
		setChannels((prev) => 
			prev.map((c) => (c.id === channel.id ? { ...c, ...channel } : c)))
	}

	async function renameChannel(id: number, name: string): Promise<boolean> {
		const res = await fetch(`/chat/channels/${id}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name }),
		})
		if (!res.ok) return false
		setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
		return true
	}

	async function updateDescription(id: number, description: string): Promise<boolean> {
		const res = await fetch(`/chat/channels/${id}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ description }),
		})
		if (!res.ok) return false
		setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, description } : c)))
		return true
	}

	async function addMembers(channelId: number, memberIds: number[]): Promise<boolean> {
		const res = await fetch(`/chat/channels/${channelId}/members`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ memberIds }),
		})
		return res.ok
	}

	async function updateWriteMode(id: number, writeMode: 'everyone' | 'moderators_only'): Promise<boolean> {
        const res = await fetch(`/chat/channels/${id}/write-mode`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ writeMode }),
        })
        if (!res.ok) return false
        setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, writeMode } : c)))
        return true
    }

	async function updateMemberRole(channelId: number, userId: number, role: 'moderator' | 'member'): Promise<boolean> {
        const res = await fetch(`/chat/channels/${channelId}/members/${userId}/role`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ role }),
        })
        return res.ok
    }

	return {
		channels,
		createChannel,
		deleteChannel,
		addChannel,
		removeChannel,
		renameChannel,
		updateDescription,
		addMembers,
		updateChannel,
		updateWriteMode,
		updateMemberRole
	}
}
