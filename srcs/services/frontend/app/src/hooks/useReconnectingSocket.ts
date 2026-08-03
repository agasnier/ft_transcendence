import { useEffect, useRef } from 'react'

export function useReconnectingSocket(url: string, onMessage: (data: any) => void) {
	const onMessageRef = useRef(onMessage)
	onMessageRef.current = onMessage

	useEffect(() => {
		let socket: WebSocket | null = null
		let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
		let closed = false

		function connect() {
			socket = new WebSocket(url)
			socket.onmessage = (event) => onMessageRef.current(JSON.parse(event.data))
			socket.onclose = () => {
				if (!closed) reconnectTimeout = setTimeout(connect, 3000)
			}
		}

		function handleVisibilityChange() {
			if (document.visibilityState !== 'visible') return
			if (socket && socket.readyState === WebSocket.OPEN) return
			if (reconnectTimeout) clearTimeout(reconnectTimeout)
			connect()
		}

		connect()
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			closed = true
			document.removeEventListener('visibilitychange', handleVisibilityChange)
			if (reconnectTimeout) clearTimeout(reconnectTimeout)
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.onclose = null
				socket.close()
			}
		}
	}, [url])
}
