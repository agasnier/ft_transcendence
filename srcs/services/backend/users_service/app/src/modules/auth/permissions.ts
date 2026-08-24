import type { FastifyRequest, FastifyReply } from 'fastify'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'

type Role = 'admin' | 'user'

export function requireSelfOrRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      await reply.status(401).send({ message: 'Not authenticated' })
      return
    }

    const targetId = Number((request.params as { id: string }).id)

    // if user === target
    if (request.user.id === targetId) {
      return
    }

    // if not, need the role
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, request.user.id),
      columns: { role: true },
    })

    if (!dbUser || !allowedRoles.includes(dbUser.role as Role)) {
      await reply.status(403).send({ message: 'Insufficient permissions' })
      return
    }
  }
}