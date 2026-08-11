import { useReconnectingSocket } from '../hooks/useReconnectingSocket'

export function usePresenceSocket() {
	const presenceSocketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/presence/ws`
	useReconnectingSocket(presenceSocketUrl, () => {})
}
