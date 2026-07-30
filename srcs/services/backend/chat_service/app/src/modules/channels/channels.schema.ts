export const listUserChannelsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: ['string', 'null'] },
          type: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
  },
}

export const createChannelSchema = {
  body: {
    type: 'object',
    required: ['memberIds', 'type'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      type: { type: 'string', enum: ['channel', 'group', 'discussion'] },
      memberIds: {
        type: 'array',
        minItems: 1,
        items: { type: 'integer', minimum: 1 },
      },
    },
  },
}

export const deleteChannelSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
}

export const listChannelMembersSchema = {
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
      items: { type: 'integer' },
    },
  },
}

export const listAllChannelsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' },
          isMember: { type: 'boolean' },
        },
      },
    },
  },
}
