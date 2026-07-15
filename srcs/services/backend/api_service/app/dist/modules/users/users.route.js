import { listUsersController, getUserController, createUserController, updateUserController, deleteUserController } from './users.controller.js';
import { apiKeyAuthHook } from '../api_keys/api_keys.controller.js';
export async function usersRoutes(app) {
    app.addHook('onRequest', apiKeyAuthHook);
    app.get('/', listUsersController);
    app.get('/:id', getUserController);
    app.post('/', createUserController);
    app.put('/:id', updateUserController);
    app.delete('/:id', deleteUserController);
}
//# sourceMappingURL=users.route.js.map