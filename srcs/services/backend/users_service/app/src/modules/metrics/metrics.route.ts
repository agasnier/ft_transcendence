import type { FastifyInstance } from 'fastify'
import client from 'prom-client'
import { count, eq, gt } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { friends, jwtRefreshToken, twoFA, users } from '../../db/schema.js'

client.register.clear()

/**
	Histogramme Prometheus mesurant la latence des requêtes HTTP
	ventilée par méthode, route et code de statut.
*/
const httpRequestDuration = new client.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.05, 0.1, 0.3, 0.5, 1, 3, 5],
})

/**
	Jauge Prometheus du nombre de connexions utilisateurs actives.
*/
const usersActiveConnections = new client.Gauge({
	name: 'users_active_connections',
	help: 'Number of active user connections',
})

/**
	Jauge Prometheus du nombre total d'utilisateurs inscrits.
*/
const usersRegisteredTotal = new client.Gauge({
	name: 'users_registered_total',
	help: 'Total number of registered users',
})

/**
	Jauge Prometheus du nombre d'utilisateurs avec le rôle administrateur.
*/
const usersAdminsTotal = new client.Gauge({
	name: 'users_admins_total',
	help: 'Total number of admin users',
})

/**
	Jauge Prometheus du nombre d'utilisateurs ayant activé la double authentification (2FA).
*/
const users2faEnabledTotal = new client.Gauge({
	name: 'users_2fa_enabled_total',
	help: 'Total number of users with 2FA enabled',
})

/**
	Jauge Prometheus du nombre de jetons de rafraîchissement JWT valides et non expirés.
*/
const jwtActiveTokensTotal = new client.Gauge({
	name: 'jwt_active_tokens_total',
	help: 'Number of active non-expired JWT refresh tokens',
})

/**
	Jauge Prometheus du nombre de relations d'amitié acceptées.
*/
const friendsPairsTotal = new client.Gauge({
	name: 'friends_pairs_total',
	help: 'Total number of accepted friend relationships',
})

/**
	Jauge Prometheus du nombre de demandes d'amitié en attente.
*/
const friendsPendingTotal = new client.Gauge({
	name: 'friends_pending_total',
	help: 'Total number of pending friend requests',
})

/**
	Enregistre les métriques Prometheus (latence HTTP, statistiques des utilisateurs,
	rôles, 2FA, JWT et amitiés) et expose l'endpoint `/metrics`.
*/
export async function metricsRoutes(app: FastifyInstance): Promise<void> {
	// Enregistre le timestamp de début pour chaque requête entrante
	app.addHook('onRequest', (request, reply, done) => {
		(reply as any).startTime = process.hrtime()
		done()
	})

	// Calcule la durée totale de la requête et met à jour l'histogramme de latence
	app.addHook('onResponse', (request, reply, done) => {
		if ((reply as any).startTime) {
			const diff = process.hrtime((reply as any).startTime)
			const durationInSeconds = diff[0] + diff[1] / 1e9
			httpRequestDuration
				.labels(
					request.method,
					request.routeOptions?.url || request.url,
					reply.statusCode.toString(),
				)
				.observe(durationInSeconds)
		}
		done()
	})

	// Endpoint scrapé par Prometheus pour exposer les métriques du users_service
	app.get('/metrics', async (_request, reply) => {
		try {
			// Total des utilisateurs inscrits
			const registeredRes = await db.select({ value: count() }).from(users)
			usersRegisteredTotal.set(registeredRes[0]?.value ?? 0)

			// Total des administrateurs
			const adminsRes = await db
				.select({ value: count() })
				.from(users)
				.where(eq(users.role, 'admin'))
			usersAdminsTotal.set(adminsRes[0]?.value ?? 0)

			// Utilisateurs avec 2FA activé
			const twoFaRes = await db
				.select({ value: count() })
				.from(twoFA)
				.where(eq(twoFA.enabled, true))
			users2faEnabledTotal.set(twoFaRes[0]?.value ?? 0)

			// Tokens JWT de rafraîchissement encore valides
			const jwtRes = await db
				.select({ value: count() })
				.from(jwtRefreshToken)
				.where(gt(jwtRefreshToken.expires_at, new Date()))
			jwtActiveTokensTotal.set(jwtRes[0]?.value ?? 0)

			// Relations d'amitié acceptées
			const friendsAcceptedRes = await db
				.select({ value: count() })
				.from(friends)
				.where(eq(friends.status, 'accepted'))
			friendsPairsTotal.set(friendsAcceptedRes[0]?.value ?? 0)

			// Demandes d'amitié en attente
			const friendsPendingRes = await db
				.select({ value: count() })
				.from(friends)
				.where(eq(friends.status, 'pending'))
			friendsPendingTotal.set(friendsPendingRes[0]?.value ?? 0)
		} catch {
			// Ignore les erreurs de base de données lors de la collecte des métriques
		}

		reply.header('Content-Type', client.register.contentType)
		return await client.register.metrics()
	})
}


