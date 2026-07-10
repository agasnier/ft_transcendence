export const loginSchema = {
  body: {
    type: 'object',
    required: ['pseudo', 'password'],
    additionalProperties: false,
    properties: {
      pseudo: { type: 'string', minLength: 1, maxLength: 255 },
      password: { type: 'string', minLength: 8, maxLength: 255 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: { message: { type: 'string' } },
    },
  },
}

