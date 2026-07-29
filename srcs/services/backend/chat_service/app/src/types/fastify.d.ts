import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number
      pseudo: string
      role: string
    }
  }
}
