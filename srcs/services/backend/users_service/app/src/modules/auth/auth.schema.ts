const registerBody = {
  type: 'object',
  required: ['mail', 'pseudo', 'password'],
  additionalProperties: false,
  properties: {
    mail: { type: 'string', format: 'email', maxLength: 255 },
    pseudo: { type: 'string', minLength: 1, maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 255 },
  },
}

const loginBody = {
  type: 'object',
  required: ['login', 'password'],
  additionalProperties: false,
  properties: {
    login: { type: 'string', minLength: 1, maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 255 },
  },
}

export const registerSchema = {
  body: registerBody,
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        pseudo: { type: 'string' },
      },
    },
  },
}

export const loginSchema = {
  body: loginBody,
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        requires2FA: { type: 'boolean' },
      },
    },
  },
}
