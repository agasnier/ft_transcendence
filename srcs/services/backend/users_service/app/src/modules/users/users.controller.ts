import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAllUsers, getUserById, getUsersByIds, createUser, updateUser, deleteUser, listUsers, updateUserProfile, getUserProfile, updateAvatar, getPublicUserProfile, deleteAvatar } from './users.service.js'
import { deleteRefreshTokensByUser } from '../auth/auth.service.js'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import { unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { env } from '../../config/env.js'


// Lists all registered users. A non-admin caller only ever sees the public fields
// (id, pseudo, displayName, avatarUrl) — the sanitize step here is a deliberate
// second layer of protection on top of listUsers' own role check, so a future bug
// in the service can't leak mail/role to a non-admin.
export async function listUsersController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    if (!request.user) {
      await reply.status(401).send({ message: 'Not authenticated' })
      return
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, request.user.id),
      columns: { role: true },
    })

    const requesterRole = dbUser?.role as 'admin' | 'user'
    const list = await listUsers(requesterRole)

    // One more security : even if listUsers let some data, it can't be otu if non-admin user
    if (requesterRole !== 'admin') {
      const sanitized = list.map((u: any) => ({
        id: u.id,
        pseudo: u.pseudo,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
      }))
      await reply.send(sanitized)
      return
    }

    await reply.send(list)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

const MAX_BATCH_IDS = 100

// Batch lookup used to resolve pseudo/avatar for a list of user ids at once (e.g.
// when rendering a channel's member list), avoiding one request per user.
export async function listUsersBatchController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { ids } = request.query as { ids: string }
    const parsedIds = [...new Set(ids.split(',').map(Number))].filter((id) => Number.isInteger(id) && id > 0)

    if (parsedIds.length === 0 || parsedIds.length > MAX_BATCH_IDS) {
      await reply.status(400).send({ message: 'Invalid ids' })
      return
    }

    const list = await getUsersByIds(parsedIds)
    await reply.send(list)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function getUserController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
  
    if (!Number.isInteger(id) || Number(id) <= 0) {
      await reply.status(400).send({ message: 'Invalid id' })
      return
    }

    const user = await getUserById(Number(id))
    if (!user) {
      await reply.status(404).send({ message: 'User not found' })
      return
    }

    await reply.send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

// Public registration endpoint. Note the body type only allows mail/pseudo/password —
// role can never be set here, so nobody can self-promote to admin at signup.
export async function createUserController(
  request: FastifyRequest<{ Body: { mail: string; pseudo: string; password: string } }>, reply: FastifyReply): Promise<void> {
  try {
    const { mail, pseudo, password } = request.body
    const user = await createUser(mail, pseudo, password)

    await reply.status(201).send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

// Updates a user's account fields. Anyone can update their own account (checked
// upstream by requireSelfOrRole), but changing "role" specifically always requires
// the caller to be an admin, regardless of whose account is being edited.
export async function updateUserController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    if (!request.user) {
      await reply.status(401).send({ message: 'Not authenticated' })
      return
    }

    const { id } = request.params as { id: string }
    const body = request.body as { mail?: string; pseudo?: string; password?: string; role?: 'admin' | 'user' }
  
    // Only admin can change role.
    if (body.role) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, request.user.id),
        columns: { role: true },
      })
      if (dbUser?.role !== 'admin') {
        await reply.status(403).send({ message: 'Only admins can change roles' })
        return
      }
    }

    const user = await updateUser(Number(id), body)

    if (!user) {
      await reply.status(404).send({ message: 'User not found' })
      return
    }
    if (body.pseudo !== undefined) {
      fetch(`${env.chatServiceUrl}/chat/internal/user-pseudo-updated/${user.id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pseudo: user.pseudo }),
      }).catch(() => {})
    }
    await reply.send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

// Deletes a user account (admin only, enforced upstream). On top of removing the
// row, this also revokes the session immediately: refresh tokens are deleted so
// /auth/session can't issue a new access token, and chat_service is asked to force-
// close any active WebSocket connection, so the deleted user can't keep chatting
// until their current token naturally expires.
export async function deleteUserController(
  request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const userId = Number(id)
    const deleted = await deleteUser(userId)
    if (!deleted) {
      await reply.status(404).send({ message: 'User not found' })
      return
    }

    // Remove all refresh tokens : no more reconnection from /auth/session
    await deleteRefreshTokensByUser(userId)

    // Cut all active websocket connection (chat_service)
    fetch(`${env.chatServiceUrl}/chat/internal/force-disconnect/${userId}`, { method: 'POST' }).catch(() => {})

    await reply.status(200).send({ message: 'User deleted' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

// Updates the current user's own profile (displayName/bio). Distinct from
// updateUserController: this is self-service only, no admin path, no role field.
export async function updateProfileController(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
		await reply.code(401).send({ message: 'Not authenticated' })
		return
	}
  const body = req.body as { displayName?: string; bio?: string }
  const updated = await updateUserProfile(req.user.id, body)
  return reply.send(updated);
}

// Returns the current user's own full profile (including private fields not shown
// on the public profile endpoint).
export async function getUserProfileController(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
    await reply.code(401).send({ message: 'Not authenticated' })
    return
  }

  const user = await getUserProfile(req.user.id)
  if (!user) {
    await reply.code(404).send({ message: 'User not found' })
    return
  }
  return reply.send(user)
}

// Uploads/replaces the current user's avatar. Deletes the previous file from disk
// first to avoid orphaned files, then notifies chat_service so any channel member
// lists showing this user's avatar can update live (avatars are cached/displayed
// independently in chat_service, so it needs to know when one changes).
export async function uploadAvatarController(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
		await reply.code(401).send({ message: 'Not authenticated' })
		return
	}
  const data = await req.file();
  if (!data) {
    await reply.code(400).send({ message: 'No file provided' })
    return
  }
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowed.includes(data.mimetype)) {
    await reply.code(400).send({ message: 'Invalid file type' })
    return
  }

  // delete previous avatar
  const currentUser = await getUserById(req.user.id)
  if (currentUser?.avatarUrl) {
    const oldFilename = currentUser.avatarUrl.replace('/avatars/', '')
    await unlink(path.join('/app/uploads/avatars', oldFilename)).catch(() => {})
  }

  const filename = `${randomUUID()}${path.extname(data.filename)}`
  const filepath = path.join('/app/uploads/avatars', filename)
  await pipeline(data.file, createWriteStream(filepath))
  const avatarUrl = `/avatars/${filename}`
  await updateAvatar(req.user.id, avatarUrl)
  fetch(`${env.chatServiceUrl}/chat/internal/user-avatar-updated/${req.user.id}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ avatarUrl }),
  }).catch(() => {})
  return reply.send({ avatarUrl })
}

// Removes the current user's avatar (reverts to the fallback letter avatar on the
// frontend), and notifies chat_service the same way as an upload.
export async function deleteAvatarController(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
    await reply.code(401).send({ message: 'Not authenticated' })
    return
  }
  await deleteAvatar(req.user.id)
  fetch(`${env.chatServiceUrl}/chat/internal/user-avatar-updated/${req.user.id}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ avatarUrl: null }),
  }).catch(() => {})
  return reply.send({ message: 'Avatar removed' })
}

// Returns another user's public profile (displayName, avatarUrl, bio, role) — used
// when viewing someone else's profile, e.g. from a channel member list. Deliberately
// excludes mail (see getPublicUserProfile in the service for the exact field set).
export async function getPublicUserProfileController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const user = await getPublicUserProfile(Number(id))
    if (!user) {
      await reply.status(404).send({ message: 'User not found' })
      return
    }
    await reply.send(user)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}