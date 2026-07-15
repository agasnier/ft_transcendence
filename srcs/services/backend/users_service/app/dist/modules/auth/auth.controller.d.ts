import type { FastifyReply, FastifyRequest } from 'fastify';
export declare function registerController(request: FastifyRequest<{
    Body: {
        mail: string;
        pseudo: string;
        password: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function loginController(request: FastifyRequest<{
    Body: {
        login: string;
        password: string;
    };
}>, reply: FastifyReply): Promise<void>;
export declare function logoutController(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function sessionController(request: FastifyRequest, reply: FastifyReply): Promise<void>;
