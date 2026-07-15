import { createHmac, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { jwtRefreshToken } from '../../db/schema.js';
import { env } from '../../config/env.js';
function hash(value) {
    return createHmac('sha256', env.pepper).update(value).digest('hex');
}
export async function createCookie(reply, user) {
    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);
    reply
        .setCookie('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' })
        .setCookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth' });
}
export function createAccessToken(user) {
    return jwt.sign(user, env.jwtPrivateKey, { algorithm: 'ES256', expiresIn: env.accessTokenExpiration });
}
export function validateAccessToken(token) {
    try {
        return jwt.verify(token, env.jwtPublicKey, { algorithms: ['ES256'] });
    }
    catch {
        return null;
    }
}
export async function createRefreshToken(owner_id) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpirationDays);
    await db
        .insert(jwtRefreshToken)
        .values({ owner_id, token_hash: hash(token), expires_at: expiresAt });
    return token;
}
export async function deleteRefreshToken(token) {
    await db
        .delete(jwtRefreshToken)
        .where(eq(jwtRefreshToken.token_hash, hash(token)));
}
export async function validateRefreshToken(token) {
    const rows = await db
        .select()
        .from(jwtRefreshToken)
        .where(eq(jwtRefreshToken.token_hash, hash(token)))
        .limit(1);
    const stored = rows[0];
    if (!stored || stored.expires_at < new Date())
        return null;
    return stored;
}
//# sourceMappingURL=auth.service.js.map