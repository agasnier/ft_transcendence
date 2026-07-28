import { env } from '../../config/env.js'

export async function hashApiKey(apiKey: string): Promise<string> {
  const res = await fetch(`${env.vaultAgentUrl}/v1/transit/hmac/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: Buffer.from(apiKey, 'utf8').toString('base64'),
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
