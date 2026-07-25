import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { WebSocket, RawData } from 'ws'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { WS_ERRORS } from './ws.error.js'

interface ActiveClient {
	socket: WebSocket
	userId: string
	isAlive: boolean
}

interface JwtPayload {
	id: number
	pseudo: string
}

export const activeClients = new Map<string, ActiveClient>()

function getCookieValue(cookieHeader: string | undefined, cookieName: string): string | undefined {
	if (!cookieHeader) return undefined
	const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`))
	return match ? decodeURIComponent(match[1]) : undefined
}

export function sendToUser(userId: string, data: object): boolean {
	const client = activeClients.get(userId)
	if (client && client.socket.readyState === 1) {
		client.socket.send(JSON.stringify(data))
		return true
	}
	return false
}

export function broadcast(data: object, excludeuserId?: string) {
	const rawData = JSON.stringify(data)
	for (const [userId, client] of activeClients.entries()) {
		if (userId !== excludeuserId && client.socket && client.socket.readyState === 1) {
			client.socket.send(rawData)
		}
	}
}

function authenticateWebSocket(req: FastifyRequest, app: FastifyInstance): number | null {
	try {
		const rawCookieHeader = req.headers['cookie'] || (req.raw?.headers as any)?.cookie
		const tokenFromCookie = req.cookies?.access_token || getCookieValue(rawCookieHeader, 'access_token')
		const queryToken = (req.query as any)?.token
		const finalToken = tokenFromCookie || queryToken

		if (!finalToken) {
			app.log.warn(`[WS Auth Failed] Aucun token trouvé (Cookie header: ${rawCookieHeader})`)
			return null
		}

		const decoded = jwt.verify(finalToken, env.jwtPublicKey, { algorithms: ['ES256'] }) as JwtPayload
		return decoded.id
	} catch (err: any) {
		app.log.warn(`[WS Auth Failed] Vérification JWT échouée : ${err?.message}`)
		return null
	}
}

function closeSocket(connection: any, code: number, reason: string): void {
	const ws = connection.socket ?? connection.raw ?? connection
	if (ws && typeof ws.close === 'function') {
		try {
			ws.close(code, reason)
		} catch {
			if (typeof connection.destroy === 'function') connection.destroy()
		}
	} else if (typeof connection.destroy === 'function') {
		connection.destroy()
	}
}

export function handleWebSocket(connection: any, req: FastifyRequest, app: FastifyInstance): void {
	const socket: WebSocket = connection.socket ?? connection.raw ?? connection

	const userIdNum = authenticateWebSocket(req, app)
	if (userIdNum === null) {
		app.log.warn(WS_ERRORS.UNAUTHORIZED.log)
		closeSocket(connection, WS_ERRORS.UNAUTHORIZED.code, WS_ERRORS.UNAUTHORIZED.reason)
		return
	}

	const userId = String(userIdNum)
	app.log.info(`[WS] Client connecté et authentifié : ID ${userId}`)

	const clientInfo: ActiveClient = {
		socket,
		userId,
		isAlive: true,
	}
	activeClients.set(userId, clientInfo)
	broadcast({ type: 'USER_STATUS', payload: { userId, status: 'online' } }, userId)

	socket.on('pong', () => {
		const client = activeClients.get(userId)
		if (client) {
			client.isAlive = true
		}
	})

	socket.on('message', (rawData: RawData) => {
		try {
			const event = JSON.parse(rawData.toString())
			app.log.info(`[WS] Message reçu de ${userId} :`, event)

			switch (event.type) {
				case 'PING':
					socket.send(JSON.stringify({ type: 'PONG' }))
					break
				case 'CHAT_MESSAGE':
					broadcast({
						type: 'NEW_CHAT_MESSAGE',
						payload: {
							senderId: userId,
							text: event.payload?.text,
							timestamp: new Date().toISOString(),
						},
					})
					break
				default:
					socket.send(JSON.stringify({ type: 'ERROR', payload: 'Événement non pris en charge' }))
			}
		} catch {
			socket.send(JSON.stringify({ type: 'ERROR', payload: 'Format JSON invalide' }))
		}
	})

	socket.on('close', (code: number, reason: Buffer) => {
		app.log.info(`[WS] Client déconnecté : ${userId} (Code: ${code}, Raison: ${reason ? reason.toString() : ''})`)
		activeClients.delete(userId)
		broadcast({ type: 'USER_STATUS', payload: { userId, status: 'offline' } })
	})

	socket.on('error', (err: Error) => {
		app.log.error(err, `[WS] Erreur sur le socket de l'utilisateur ${userId}`)
	})
}

export function startHeartbeatMonitor(app: FastifyInstance): void {
	const interval = setInterval(() => {
		for (const [userId, client] of activeClients.entries()) {
			if (client.isAlive === false) {
				app.log.warn(`[WS] Session morte détectée pour l'utilisateur ${userId}. Fermeture du socket.`)
				if (client.socket && typeof client.socket.terminate === 'function') {
					client.socket.terminate()
				}
				activeClients.delete(userId)
				continue
			}

			client.isAlive = false
			if (client.socket && typeof client.socket.ping === 'function') {
				client.socket.ping()
			}
		}
	}, 30000)

	app.addHook('onClose', (instance, done) => {
		clearInterval(interval)
		done()
	})
}