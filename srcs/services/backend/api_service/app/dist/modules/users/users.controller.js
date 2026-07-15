import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './users.service.js';
export async function listUsersController(request, reply) {
    const users = await getAllUsers();
    await reply.send(users);
}
export async function getUserController(request, reply) {
    const user = await getUserById(Number(request.params.id));
    await reply.send(user);
}
export async function createUserController(request, reply) {
    if (request.auth?.role !== 'admin') {
        await reply.status(403).send({ message: 'Forbidden' });
        return;
    }
    const user = await createUser(request.body);
    await reply.status(201).send(user);
}
export async function updateUserController(request, reply) {
    if (request.auth?.role !== 'admin' && request.auth?.ownerId !== Number(request.params.id)) {
        await reply.status(403).send({ message: 'Forbidden' });
        return;
    }
    const user = await updateUser(Number(request.params.id), request.body);
    await reply.send(user);
}
export async function deleteUserController(request, reply) {
    if (request.auth?.role !== 'admin') {
        await reply.status(403).send({ message: 'Forbidden' });
        return;
    }
    await deleteUser(Number(request.params.id));
    await reply.send({ message: 'User deleted' });
}
//# sourceMappingURL=users.controller.js.map