import { useEffect, useRef } from 'react'

// Opens a WebSocket to `url` and keeps it alive
// Reconnects automatically 3s after any close, and immediately when the tab regains focus
// Backgrounded tabs get throttled, so a dead connection could otherwise sit unnoticed for a while
export function useReconnectingSocket(url: string, onMessage: (data: any) => void) {
	const onMessageRef = useRef(onMessage)
	onMessageRef.current = onMessage

	useEffect(() => {
		let socket: WebSocket | null = null
		let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
		let stopped = false

		function connect() {
			socket = new WebSocket(url)
			socket.onmessage = (event) => onMessageRef.current(JSON.parse(event.data))
			socket.onclose = () => {
				if (!stopped) reconnectTimeout = setTimeout(connect, 3000)
			}
		}

		function handleVisibilityChange() {
			if (document.visibilityState !== 'visible')
				return
			if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING))
				return
			if (reconnectTimeout)
				clearTimeout(reconnectTimeout)
			connect()
		}

		connect()
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			stopped = true
			document.removeEventListener('visibilitychange', handleVisibilityChange)
			if (reconnectTimeout) clearTimeout(reconnectTimeout)
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.onclose = null
				socket.close()
			}
		}
	}, [url])
}
