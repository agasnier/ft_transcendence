import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './users.service.js';
export async function listUsersController(request, reply) {
    try {
        const users = await getAllUsers();
        await reply.send(users);
    }
    catch (err) {
        request.log.error(err);
        await reply.status(500).send({ message: 'Internal error' });
    }
}
export async function getUserController(request, reply) {
    try {
        const id = Number(request.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            await reply.status(400).send({ message: 'Invalid id' });
            return;
        }
        const user = await getUserById(id);
        if (!user) {
            await reply.status(404).send({ message: 'User not found' });
            return;
        }
        await reply.send(user);
    }
    catch (err) {
        request.log.error(err);
        await reply.status(500).send({ message: 'Internal error' });
    }
}
export async function createUserController(request, reply) {
    try {
        const { mail, pseudo, password } = request.body;
        const user = await createUser(mail, pseudo, password);
        await reply.status(201).send(user);
    }
    catch (err) {
        request.log.error(err);
        await reply.status(500).send({ message: 'Internal error' });
    }
}
export async function updateUserController(request, reply) {
    try {
        const id = Number(request.params.id);
        const user = await updateUser(id, request.body);
        if (!user) {
            await reply.status(404).send({ message: 'User not found' });
            return;
        }
        await reply.send(user);
    }
    catch (err) {
        request.log.error(err);
        await reply.status(500).send({ message: 'Internal error' });
    }
}
export async function deleteUserController(request, reply) {
    try {
        const id = Number(request.params.id);
        const deleted = await deleteUser(id);
        if (!deleted) {
            await reply.status(404).send({ message: 'User not found' });
            return;
        }
        await reply.status(200).send({ message: 'User deleted' });
    }
    catch (err) {
        request.log.error(err);
        await reply.status(500).send({ message: 'Internal error' });
    }
}
//# sourceMappingURL=users.controller.js.map