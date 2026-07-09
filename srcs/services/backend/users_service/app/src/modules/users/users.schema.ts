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

export const createUserSchema = {
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
    201: {
      type: 'object',
      properties: userProperties,
    },
  },
}

export const updateUserSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
  body: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      pseudo: { type: 'string', minLength: 1, maxLength: 255 },
      password: { type: 'string', minLength: 8, maxLength: 255 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: userProperties,
    },
  },
}

export const deleteUserSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
}
