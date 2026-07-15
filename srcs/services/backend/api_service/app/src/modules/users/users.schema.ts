// user schema needed
const userProperties = {
  id: { type: 'integer' },
  pseudo: { type: 'string' },
  mail: { type: 'string' },
  role: { type: 'string', enum: ['admin', 'user'] },
}

export const listUsersSchema = {
  tags: ['users'],
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
  tags: ['users'],
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
  tags: ['users'],
  body: {
    type: 'object',
    required: ['mail', 'pseudo', 'password'],
    additionalProperties: false,
    properties: {
      mail: { type: 'string', format: 'email', maxLength: 255 },
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
  tags: ['users'],
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
      mail: { type: 'string', format: 'email', maxLength: 255 },
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
  tags: ['users'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
}
