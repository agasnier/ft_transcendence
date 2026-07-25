import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketContextType {
	isConnected: boolean
	lastMessage: any
	sendMessage: (type: string, payload?: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export const WebSocketProvider: React.FC<{ children: React.ReactNode; url?: string; token?: string | null }> = ({ children, url, token }) => {
	const [isConnected, setIsConnected] = useState(false)
	const [lastMessage, setLastMessage] = useState<any>(null)
	const ws = useRef<WebSocket | null>(null)
	const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	const resolveUrl = useCallback(() => {
		let baseUrl = url
		if (!baseUrl) {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
			baseUrl = `${protocol}//${window.location.host}/api/ws`
		}

		if (token) {
			const separator = baseUrl.includes('?') ? '&' : '?'
			return `${baseUrl}${separator}token=${encodeURIComponent(token)}`
		}
		return baseUrl
	}, [url, token])

	const connect = useCallback(() => {
		if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
			return
		}

		const targetUrl = resolveUrl()
		console.log('[WS] Tentative de connexion à :', targetUrl)
		const socket = new WebSocket(targetUrl)
		ws.current = socket

		socket.onopen = () => {
			console.log('[WS] Connexion établie avec le serveur.')
			setIsConnected(true)
			if (reconnectTimeout.current) {
				clearTimeout(reconnectTimeout.current)
				reconnectTimeout.current = null
			}
		}

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				setLastMessage(data)
			} catch {
				setLastMessage(event.data)
			}
		}

		socket.onclose = (event) => {
			setIsConnected(false)
			console.log(`[WS] Connexion fermée (Code: ${event.code}). Reconnexion dans 3s...`)

			ws.current = null
			reconnectTimeout.current = setTimeout(() => {
				connect()
			}, 3000)
		}

		socket.onerror = (error) => {
			console.error('[WS] Erreur détectée :', error)
			socket.close()
		}
	}, [resolveUrl])

	useEffect(() => {
		connect()
		return () => {
			if (ws.current) {
				ws.current.onclose = null
				if (ws.current.readyState === WebSocket.OPEN) {
                    ws.current.close()
                }

			}
			if (reconnectTimeout.current) {
				clearTimeout(reconnectTimeout.current)
			}
		}
	}, [connect])

	const sendMessage = useCallback((type: string, payload: any = {}) => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify({ type, payload }))
		} else {
			console.warn('[WS] Impossible d\'envoyer le message : connexion non établie.')
		}
	}, [])

	return (
		<WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
			{children}
		</WebSocketContext.Provider>
	)
}

export const useWebSocket = () => {
	const context = useContext(WebSocketContext)
	if (!context) {
		throw new Error('useWebSocket doit être utilisé à l\'intérieur de WebSocketProvider')
	}
	return context
}
