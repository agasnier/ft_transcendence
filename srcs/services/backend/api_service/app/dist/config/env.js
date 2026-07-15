import { readFileSync } from 'node:fs';
function readVaultSecret(path, field) {
    return JSON.parse(readFileSync(path, 'utf8'))[field];
}
export const env = {
    host: '0.0.0.0',
    port: 3000,
    usersServiceUrl: 'http://users_service:3000',
    pepper: readVaultSecret('/vault/secrets/pepper.json', 'pepper'),
    jwtPublicKey: readVaultSecret('/vault/secrets/jwt_public.json', 'publicKey'),
    apiKeyExpirationDays: 15,
};
//# sourceMappingURL=env.js.map