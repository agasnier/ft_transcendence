import { registerController, loginController, logoutController, sessionController } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schema.js';
export async function authRoutes(app) {
    app.post('/register', { schema: registerSchema }, registerController);
    app.post('/login', { schema: loginSchema }, loginController);
    app.post('/logout', logoutController);
    app.get('/session', sessionController);
}
//# sourceMappingURL=auth.route.js.map