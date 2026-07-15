import type { FastifyReply, FastifyRequest } from 'fastify';
export declare function listApiKeysController(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getApiKeysController(request: FastifyRequest<{
    Params: {
        owner_id: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function createApiKeysController(request: FastifyRequest<{
    Body: {
        owner_id: number;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function updateApiKeysController(request: FastifyRequest<{
    Params: {
        owner_id: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function deleteApiKeysController(request: FastifyRequest<{
    Params: {
        owner_id: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function apiKeyAuthHook(request: FastifyRequest, reply: FastifyReply): Promise<void>;
