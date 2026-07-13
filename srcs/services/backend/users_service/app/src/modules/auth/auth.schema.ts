const credentialsBody = {
  type: 'object',
  required: ['pseudo', 'password'],
  additionalProperties: false,
  properties: {
    pseudo: { type: 'string', minLength: 1, maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 255 },
  },
}

export const registerSchema = {
  body: credentialsBody,
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
  body: credentialsBody,
  response: {
    200: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}
