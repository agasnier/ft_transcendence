import 'fastify'

// adding user field to fastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number
      pseudo: string
      role: string
    }
  }
}
