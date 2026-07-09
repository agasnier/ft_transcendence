import 'fastify'

// adding auth field for role to fastifyResquest
declare module 'fastify' {
  interface FastifyRequest {
    auth?: {
      role: 'admin' | 'user'
      ownerId?: number
    }
  }
}
