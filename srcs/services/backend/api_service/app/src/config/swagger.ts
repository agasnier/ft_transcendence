import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger'

export const swaggerSettings = {
  openapi: {
    info: { title: 'ft_transcendence API', version: '1.0.0' },
    tags: [
      { name: 'users', description: 'Gestion des utilisateurs' },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  },
} satisfies FastifyDynamicSwaggerOptions
