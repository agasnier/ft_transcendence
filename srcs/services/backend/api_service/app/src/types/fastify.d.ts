import 'fastify'

// cadding auth field to fastifyResquest
declare module 'fastify' {
  interface FastifyRequest {
    auth?: {
      role: 'admin' | 'user'
      ownerId?: number
    }
  }
}
