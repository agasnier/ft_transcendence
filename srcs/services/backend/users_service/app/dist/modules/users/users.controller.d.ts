import type { FastifyReply, FastifyRequest } from 'fastify';
export declare function listUsersController(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getUserController(request: FastifyRequest<{
    Params: {
        id: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function createUserController(request: FastifyRequest<{
    Body: {
        mail: string;
        pseudo: string;
        password: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function updateUserController(request: FastifyRequest<{
    Params: {
        id: string;
    };
    Body: {
        mail?: string;
        pseudo?: string;
        password?: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function deleteUserController(request: FastifyRequest<{
    Params: {
        id: string;
    };
}>, reply: FastifyReply): Promise<void>;
