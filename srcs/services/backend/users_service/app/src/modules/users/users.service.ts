import { eq, inArray, or } from 'drizzle-orm'
import { unlink } from 'fs/promises'
import path from 'path'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { hashPassword, verifyPassword } from '../vault/hash.js'


// Admin-facing list of every user, with all fields (used by AdminPanel management view).
export async function getAllUsers() {
  return await db
    .select({ id: users.id, mail: users.mail, pseudo: users.pseudo, role: users.role, avatarUrl: users.avatarUrl })
    .from(users)
}

// Full user record by id (internal/admin shape, includes mail).
export async function getUserById(id: number) {
  const rows = await db
    .select({ id: users.id, mail: users.mail, pseudo: users.pseudo, role: users.role, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return rows[0]
}

// Batch lookup returning only public fields (no mail), safe to call from any
// authenticated context regardless of caller role.
export async function getUsersByIds(ids: number[]) {
  if (ids.length === 0)
    return []

  return db
    .select({ id: users.id, pseudo: users.pseudo, avatarUrl: users.avatarUrl, role: users.role })
    .from(users)
    .where(inArray(users.id, ids))
}

// Verifies login credentials for the login route. "login" can be either the mail
// or the pseudo, so both are checked. Returns null on any failure (unknown login
// or wrong password) without distinguishing which, to avoid leaking which logins exist.
export async function verifyCredentials(login: string, password: string) {
  const rows = await db
    .select({ id: users.id, pseudo: users.pseudo, role: users.role, password: users.password })
    .from(users)
    .where(or(eq(users.mail, login), eq(users.pseudo, login)))
    .limit(1)

  const user = rows[0]
  if (!user)
    return null
  if (!(await verifyPassword(user.password, password)))
    return null

  return { id: user.id, pseudo: user.pseudo, role: user.role }
}

// Creates a new account. Role is never accepted here — it always defaults to 'user'
// at the database level, so nobody can self-promote at signup.
export async function createUser(mail: string, pseudo: string, password: string) {

  const passwordHash = await hashPassword(password)

  const [result] = await db
    .insert(users)
    .values({ mail, pseudo, password: passwordHash })

  return await getUserById(result.insertId)
}

type UserRole = 'admin' | 'user'

// Changes a user's own password, requiring their current password to be correct first
// (as opposed to an admin resetting it via updateUser, which skips this check).
export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<'ok' | 'not_found' | 'invalid'> {
  const rows = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const user = rows[0]
  if (!user)
    return 'not_found'
  if (!(await verifyPassword(user.password, currentPassword)))
    return 'invalid'

  await db
    .update(users)
    .set({ password: await hashPassword(newPassword) })
    .where(eq(users.id, userId))

  return 'ok'
}

// Admin/self account update (mail, pseudo, password, role). Only touches fields
// that were actually provided. Permission checks (who can change what) happen in
// the controller — this function just applies whatever it's given.
export async function updateUser(id: number, data: { mail?: string; pseudo?: string; password?: string; role?: UserRole }) {
  const User = await getUserById(id)
  if (!User)
    return null

  const newData: { mail?: string; pseudo?: string; password?: string; role?: UserRole } = {}
  if (data.mail !== undefined)
    newData.mail = data.mail
  if (data.pseudo !== undefined)
    newData.pseudo = data.pseudo
  if (data.password !== undefined)
    newData.password = await hashPassword(data.password)
  if (data.role !== undefined)
    newData.role = data.role
  await db.update(users).set(newData).where(eq(users.id, id))

  return await getUserById(id)
}

// Returns the user list shape appropriate to the caller's role: admins get mail/role,
// everyone else only gets public fields. The controller applies an additional
// sanitize pass as a second layer of protection on top of this.
export async function listUsers(requesterRole: 'admin' | 'user') {
  if (requesterRole === 'admin') {
    return db.select({
      id: users.id,
      pseudo: users.pseudo,
      mail: users.mail,
      role: users.role,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    }).from(users)
  }

  // public vue for normal users
  return db.select({
    id:users.id,
    pseudo: users.pseudo,
    displayName: users.displayName,
    avatarUrl: users.avatarUrl,
  }).from(users)
}

// Updates the current user's own profile fields (displayName/bio), self-service only.
export async function updateUserProfile(id: number, data: { displayName?: string; bio?: string }) {
  await db.update(users).set(data).where(eq(users.id, id))
  return db.query.users.findFirst({ where: eq(users.id, id )})
}

// Returns the current user's own full profile (private view, no mail exposed here either).
export async function getUserProfile(id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, displayName: true, avatarUrl: true, bio: true, role: true },
  })
}

export async function updateAvatar(id: number, avatarUrl: string) {
  await db.update(users).set({ avatarUrl }).where(eq(users.id, id))
}

// Clears the avatar and removes the old file from disk, if one was set, to avoid
// leaving orphaned files behind.
export async function deleteAvatar(id: number) {
  const user = await getUserById(id)
  if (user?.avatarUrl) {
    const filename = user.avatarUrl.replace('/avatars/', '')
    const filepath = path.join('/app/uploads/avatars', filename)
    await unlink(filepath).catch(() => {})
  }
  await db.update(users).set({ avatarUrl: null }).where(eq(users.id, id))
}

export async function deleteUser(id: number) {
  const [result] = await db.delete(users).where(eq(users.id, id))
  return result.affectedRows > 0
}

// Public profile view for viewing someone else's account (e.g. a channel member).
// Deliberately excludes mail; includes role since it's not considered sensitive.
export async function getPublicUserProfile(id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, displayName: true, avatarUrl: true, bio: true, isOnline: true, role: true },
  })
}