import { env } from '../../config/env.js'

function base64urlDecode(segment: string): unknown {
	return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'))
}

export function dataOutput(token: string): { id: number; pseudo: string; role: string; exp: number } | null {
	const payload = token.split('.')[1]

	try {
		const userData = base64urlDecode(payload) as {
			id?: number
			pseudo?: string
			role?: string
			exp?: number
		}

		if (
			typeof userData.id !== 'number' ||
			typeof userData.pseudo !== 'string' ||
			typeof userData.role !== 'string' ||
			typeof userData.exp !== 'number'
		)
			return null

		return { id: userData.id, pseudo: userData.pseudo, role: userData.role, exp: userData.exp }
	} catch {
		return null
	}
}

export async function validateAccessToken(token: string): Promise<{ id: number; pseudo: string; role: string } | null> {
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

	return { id: userData.id, pseudo: userData.pseudo, role: userData.role }
}
