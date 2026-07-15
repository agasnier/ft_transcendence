import rateLimit from '@fastify/rate-limit';
import { listUsersController, getUserController, createUserController, updateUserController, deleteUserController } from './users.controller.js';
import { apiKeyAuthHook } from '../api_keys/api_keys.controller.js';
export async function usersRoutes(app) {
    app.addHook('onRequest', apiKeyAuthHook);
    // rate-limit scoped to /api/users only, bucketed per owner (not per API key)
    await app.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
        keyGenerator: (req) => String(req.auth?.ownerId ?? req.ip),
    });
    app.get('/', listUsersController);
    app.get('/:id', getUserController);
    app.post('/', createUserController);
    app.put('/:id', updateUserController);
    app.delete('/:id', deleteUserController);
}
//# sourceMappingURL=users.route.js.map