// user schema needed
const userProperties = {
  id: { type: 'integer' },
  pseudo: { type: 'string' },
  mail: { type: 'string' },
  role: { type: 'string', enum: ['admin', 'user'] },
}

export const listUsersBatchSchema = {
  querystring: {
    type: 'object',
    required: ['ids'],
    properties: {
      ids: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          pseudo: { type: 'string' },
          avatarUrl: { type: ['string', 'null'] },
          role: { type: 'string', enum: ['admin', 'user'] },
        },
      },
    },
  },
}

export const listUsersPublicSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      pseudo: { type: 'string' },
      displayName: { type: ['string', 'null'] },
      avatarUrl: { type: ['string', 'null'] },
    },
  },
}

export const listUsersAdminSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      pseudo: { type: 'string' },
      displayName: { type: ['string', 'null'] },
      avatarUrl: { type: ['string', 'null'] },
      mail: { type: 'string' },
      role: { type: 'string' },
    },
  },
}

export const listUsersSchema = {
  response: {
    200: listUsersAdminSchema,
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
    required: ['mail', 'pseudo', 'password'],
    additionalProperties: false,
    properties: {
      mail: { type: 'string', format: 'email', maxLength: 255 },
      pseudo: { type: 'string', minLength: 1, maxLength: 30 },
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
      mail: { type: 'string', format: 'email', maxLength: 255 },
      pseudo: { type: 'string', minLength: 1, maxLength: 30 },
      password: { type: 'string', minLength: 8, maxLength: 255 },
      role: { type: 'string', enum: ['admin', 'user'] },
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

export const updateProfileSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      displayName: { type: 'string', minLength: 2, maxLength: 50 },
      bio: { type: 'string', maxLength: 500 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        displayName: { type: ['string', 'null'] },
        avatarUrl: { type: ['string', 'null'] },
        bio: { type: ['string', 'null'] },
      },
    },
  },
}

export const getUserProfileSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        displayName: { type: ['string', 'null'] },
        avatarUrl: { type: ['string', 'null'] },
        bio: { type: ['string', 'null'] },
        role: { type: 'string', enum: ['admin', 'user'] },
      },
    },
  },
}

export const uploadAvatarSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        avatarUrl: { type: ['string', 'null'] },
      },
    },
  },
}

export const deleteAvatarSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
}

export const getPublicUserProfileSchema = {
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
      properties: {
        id: { type: 'integer' },
        displayName: { type: ['string', 'null'] },
        avatarUrl: { type: ['string', 'null'] },
        bio: { type: ['string', 'null'] },
        isOnline: { type: 'boolean' },
        role: { type: 'string', enum: ['admin', 'user'] },
      },
    },
  },
}
