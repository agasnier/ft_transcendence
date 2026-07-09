import { env } from '../../config/env.js'

const BASE = env.usersServiceUrl

function fail(res: Response): never {
  const err: any = new Error(`users_service -> ${res.status}`)
  err.statusCode = res.status
  throw err
}

export async function getAllUsers() {
  const res = await fetch(`${BASE}/users`)

  if (!res.ok)
    fail(res)
  
  return res.json()
}

export async function getUserById(id: number) {
  const res = await fetch(`${BASE}/users/${id}`)

  if (!res.ok)
    fail(res)

  return res.json()
}

export async function createUser(pseudo: string, password: string) {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pseudo, password }),
  })
  
  if (!res.ok)
    fail(res)

  return res.json()
}

export async function updateUser(id: number, data: { pseudo?: string; password?: string }) {
  const res = await fetch(`${BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok)
    fail(res)

  return res.json()
}

export async function deleteUser(id: number) {
  const res = await fetch(`${BASE}/users/${id}`, { method: 'DELETE' })
  
  if (!res.ok)
    fail(res)

  return res.json()
}
