// user schema needed
const userProperties = {
  id: { type: 'integer' },
  pseudo: { type: 'string' },
}

export const listUsersSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: userProperties,
      },
    },
  },
}

// require one id to get the user
export const getUserSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: userProperties,
    },
  },
}
