// user schema needed
const userProperties = {
  id: { type: 'integer' },
  pseudo: { type: 'string' },
  mail: { type: 'string' },
  role: { type: 'string', enum: ['admin', 'user'] },
}

export const listUsersSchema = {
  // Docs api
  tags: ['users'],
  summary: 'Lister tous les utilisateurs',

  // Fastify
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
  // Docs api
  tags: ['users'],
  summary: 'Lister l\'utilisateurs',

  // Fastify
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
  // Docs api
  tags: ['users'],
  summary: 'Créer un utilisateur',
  description: 'Réservé au rôle admin.',

  // Fastify
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
  // Docs api
  tags: ['users'],
  summary: 'Modifier un utilisateur',
  description: 'Réservé au rôle admin ou au propriétaire du compte.',

  // Fastify
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
  // Docs api
  tags: ['users'],
  summary: 'Supprimer un utilisateur',
  description: 'Réservé au rôle admin.',

  // Fastify
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
}
