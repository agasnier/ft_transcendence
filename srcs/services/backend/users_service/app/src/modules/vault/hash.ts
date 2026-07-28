import argon2 from 'argon2'

import { env } from '../../config/env.js'

async function vaultHashPassword(password: string): Promise<string> {
  const res = await fetch(`${env.vaultAgentUrl}/v1/transit/hmac/passwords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: Buffer.from(password, 'utf8').toString('base64'),
      algorithm: 'sha2-256',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Vault transit HMAC failed: ${res.status} ${body}`)
  }

  const json = (await res.json()) as { data?: { hmac?: string } }
  if (!json.data?.hmac) {
    throw new Error('Vault transit HMAC failed')
  }

  return json.data.hmac
}

export async function hashPassword(password: string): Promise<string> {
  const vaultHash = await vaultHashPassword(password)
  return argon2.hash(vaultHash)
}

export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
  const vaultHash = await vaultHashPassword(password)
  return argon2.verify(storedHash, vaultHash)
}
