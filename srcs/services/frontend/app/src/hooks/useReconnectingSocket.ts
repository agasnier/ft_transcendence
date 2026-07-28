import { useEffect, useRef } from 'react'

export function useReconnectingSocket(url: string, onMessage: (data: any) => void) {
	const onMessageRef = useRef(onMessage)
	onMessageRef.current = onMessage

	useEffect(() => {
		let socket: WebSocket | null = null
		let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

		function connect() {
			socket = new WebSocket(url)
			socket.onmessage = (event) => onMessageRef.current(JSON.parse(event.data))
			socket.onclose = () => { reconnectTimeout = setTimeout(connect, 3000) }
		}

		connect()

		return () => {
			if (reconnectTimeout) clearTimeout(reconnectTimeout)
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.onclose = null
				socket.close()
			}
		}
	}, [url])
}
