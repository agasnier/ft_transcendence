const apiKeysProperties = {
  id: { type: 'integer' },
  owner_id: { type: 'integer' },
  api_key_hash: { type: 'string' },
  created_at: { type: 'string' },
}

export const listApiKeysSchema = {
  hide: true,
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: apiKeysProperties,
      },
    },
  },
}

// require one owner_id to get the apiKeys
export const getApiKeysSchema = {
  hide: true,
  params: {
    type: 'object',
    required: ['owner_id'],
    properties: {
      owner_id: { type: 'integer', minimum: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: apiKeysProperties,
    },
  },
}

export const createApiKeysSchema = {
  hide: true,
  body: {
    type: 'object',
    required: ['owner_id'],
    additionalProperties: false,
    properties: {
      owner_id: { type: 'integer', minimum: 1 },
    },
  },
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
  hide: true,
  params: {
    type: 'object',
    required: ['owner_id'],
    properties: {
      owner_id: { type: 'integer', minimum: 1 },
    },
  },
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
  hide: true,
  params: {
    type: 'object',
    required: ['owner_id'],
    properties: {
      owner_id: { type: 'integer', minimum: 1 },
    },
  },
}

