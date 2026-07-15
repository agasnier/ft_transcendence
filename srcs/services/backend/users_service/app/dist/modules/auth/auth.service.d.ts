import type { FastifyReply } from 'fastify';
export declare function createCookie(reply: FastifyReply, user: {
    id: number;
    pseudo: string;
}): Promise<void>;
export declare function createAccessToken(user: {
    id: number;
    pseudo: string;
}): string;
export declare function validateAccessToken(token: string): {
    id: number;
    pseudo: string;
} | null;
export declare function createRefreshToken(owner_id: number): Promise<string>;
export declare function deleteRefreshToken(token: string): Promise<void>;
export declare function validateRefreshToken(token: string): Promise<{
    id: number;
    owner_id: number;
    token_hash: string;
    expires_at: Date;
} | null>;
