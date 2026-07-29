const messageResponse = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    channelId: { type: 'integer' },
    senderId: { type: 'integer' },
    content: { type: 'string' },
    createdAt: { type: 'string' },
  },
}

export const listMessagesSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
  response: {
    200: {
      type: 'array',
      items: messageResponse,
    },
  },
}

export const createMessageSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
  body: {
    type: 'object',
    required: ['content'],
    additionalProperties: false,
    properties: {
      content: { type: 'string', minLength: 1, maxLength: 2000 },
    },
  },
  response: {
    201: messageResponse,
  },
}
