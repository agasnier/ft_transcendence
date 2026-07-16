const apiKeysProperties = {
  id: { type: 'integer' },
  owner_id: { type: 'integer' },
  api_key_hash: { type: 'string' },
  expires_at: { type: 'string' },
}


export const getApiKeysSchema = {
  // Docs api
  hide: true,

  // Fastify
  response: {
    200: {
      type: 'object',
      properties: apiKeysProperties,
    },
  },
}

export const createApiKeysSchema = {
  // Docs api
  hide: true,

  // Fastify
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        owner_id: { type: 'integer' },
        apiKeyCreated: { type: 'string' },
      },
    },
  },
}

export const updateApiKeysSchema = {
  // Docs api
  hide: true,

  // Fastify
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        owner_id: { type: 'integer' },
        apiKeyCreated: { type: 'string' },
      },
    },
  },
}


export const deleteApiKeysSchema = {
  // Docs api
  hide: true,
}

