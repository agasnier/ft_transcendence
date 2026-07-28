import { env } from '../../config/env.js'

/** Encode un objet JSON en base64url (segments JWT). */
export function base64url(obj: object): string {
	return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

export function dataInput(user: { id: number; pseudo: string }): string {
	const now = Math.floor(Date.now() / 1000)

	const header = base64url({ alg: 'ES256', typ: 'JWT' })
	const payload = base64url({
		id: user.id,
		pseudo: user.pseudo,
		exp: now + env.accessTokenExpirationMinutes * 60,
	})

	return header + '.' + payload
}

export async function createAccessToken(user: { id: number; pseudo: string }): Promise<string> {
	const data = dataInput(user)

	const res = await fetch(`${env.vaultAgentUrl}/v1/transit/sign/jwt`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			input: Buffer.from(data, 'utf8').toString('base64'),
			marshaling_algorithm: 'jws',
		}),
	})

	if (!res.ok) {
		throw new Error(`Vault transit sign failed: ${res.status} ${await res.text()}`)
	}

	const body = await res.json()
	if (!body.data?.signature)
		throw new Error('Vault transit sign returned no signature')

	return data + '.' + body.data.signature
}


function base64urlDecode(segment: string): unknown {
	return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'))
}

export function dataOutput(token: string): { id: number; pseudo: string; exp: number } | null {
	const parts = token.split('.')
	const payload = parts[1]

	try {
		const userData = base64urlDecode(payload) as {
			id?: number
			pseudo?: string
			exp?: number
		}

		if (typeof userData.id !== 'number' || typeof userData.pseudo !== 'string' || typeof userData.exp !== 'number')
			return null

		return { id: userData.id, pseudo: userData.pseudo, exp: userData.exp }
	} catch {
		return null
	}
}

export async function validateAccessToken(token: string): Promise<{ id: number; pseudo: string } | null> {
	const [header, payload, signature] = token.split('.')
	const data = header + '.' + payload

	try {
		const res = await fetch(`${env.vaultAgentUrl}/v1/transit/verify/jwt`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: Buffer.from(data, 'utf8').toString('base64'),
				signature,
				marshaling_algorithm: 'jws',
			}),
		})

		if (!res.ok)
			return null

		const body = await res.json()
		if (!body.data?.valid)
			return null

	} catch {
		return null
	}

	const userData = dataOutput(token)
	if (!userData)
		return null

	if (userData.exp < Math.floor(Date.now() / 1000))
		return null

	return { id: userData.id, pseudo: userData.pseudo }
}
