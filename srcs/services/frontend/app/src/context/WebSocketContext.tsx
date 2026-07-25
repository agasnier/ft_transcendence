import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

// ==========================================
// Types & Context Initialization
// ==========================================

interface WebSocketContextType {
	isConnected: boolean
	lastMessage: any
	sendMessage: (type: string, payload?: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

// ==========================================
// WebSocket Provider Component
// ==========================================

export const WebSocketProvider: React.FC<{ children: React.ReactNode; url?: string; token?: string | null }> = ({ children, url, token }) => {
	const [isConnected, setIsConnected] = useState(false)
	const [lastMessage, setLastMessage] = useState<any>(null)
	const ws = useRef<WebSocket | null>(null)
	const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	const [currentToken, setCurrentToken] = useState<string | null>(token || null)

	useEffect(() => {
		if (token) setCurrentToken(token)
	}, [token])

	// ==========================================
	// Helper: Target URL Resolution
	// ==========================================

	const resolveUrl = useCallback(() => {
		let baseUrl = url
		if (!baseUrl) {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
			baseUrl = `${protocol}//${window.location.host}/api/ws`
		}

		const activeToken = currentToken || token
		if (activeToken) {
			const separator = baseUrl.includes('?') ? '&' : '?'
			return `${baseUrl}${separator}token=${encodeURIComponent(activeToken)}`
		}
		return baseUrl
	}, [url, token, currentToken])

	// ==========================================
	// Core Connection & Reconnection Logic
	// ==========================================

	const connect = useCallback(async () => {
		// Avoid duplicate connections if already connected or connecting
		if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
			return
		}

		// Always attempt to fetch/refresh session cookies & token before connecting
		try {
			console.log('[WS] Fetching session via /auth/session...')
			const response = await fetch('/auth/session', {
				method: 'GET',
				credentials: 'include'
			})

			if (response.ok) {
				const data = await response.json()
				console.log('[WS] Session successfully retrieved/renewed:', data)
				if (data.token) {
					setCurrentToken(data.token)
				}
			} else {
				console.warn('[WS] /auth/session response not OK (Status code:', response.status, ')')
			}
		} catch (err) {
			console.warn('[WS] Server unreachable or session error (containers down/restarting):', err)
			setIsConnected(false)
			if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
			reconnectTimeout.current = setTimeout(() => {
				connect()
			}, 3000)
			return
		}

		// Establish WebSocket Connection
		const targetUrl = resolveUrl()
		console.log('[WS] Connection attempt to:', targetUrl)
		const socket = new WebSocket(targetUrl)
		ws.current = socket

		socket.onopen = () => {
			console.log('[WS] Connection established with server.')
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

		socket.onclose = async (event) => {
			setIsConnected(false)
			ws.current = null

			console.log(`[WS] Connection closed (Code: ${event.code}). Reconnecting in 3s...`)
			reconnectTimeout.current = setTimeout(() => {
				connect()
			}, 3000)
		}

		socket.onerror = (error) => {
			console.error('[WS] Error detected:', error)
			socket.close()
		}
	}, [resolveUrl])

	// ==========================================
	// Lifecycle & Cleanup Effect
	// ==========================================

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

	// ==========================================
	// Outgoing Message Utility
	// ==========================================

	const sendMessage = useCallback((type: string, payload: any = {}) => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify({ type, payload }))
		} else {
			console.warn('[WS] Cannot send message: Connection not open.')
		}
	}, [])

	return (
		<WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
			{children}
		</WebSocketContext.Provider>
	)
}

// ==========================================
// Custom Hook
// ==========================================

export const useWebSocket = () => {
	const context = useContext(WebSocketContext)
	if (!context) {
		throw new Error('useWebSocket must be used within a WebSocketProvider')
	}
	return context
}
