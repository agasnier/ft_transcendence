import { env } from '../../config/env.js'

const BASE = `${env.usersServiceUrl}/users/internal`

function fail(res: Response): never {
  const err: any = new Error(`users_service -> ${res.status}`)
  err.statusCode = res.status
  throw err
}

export async function getAllUsers() {
  const res = await fetch(BASE)

  if (!res.ok)
    fail(res)
  
  return res.json()
}

export async function getUserById(id: number) {
  const res = await fetch(`${BASE}/${id}`)

  if (!res.ok)
    fail(res)

  return res.json()
}

export async function createUser(body: unknown) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  
  if (!res.ok)
    fail(res)

  return res.json()
}

export async function updateUser(id: number, body: unknown) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok)
    fail(res)

  return res.json()
}

export async function deleteUser(id: number) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  
  if (!res.ok)
    fail(res)

  return res.json()
}
