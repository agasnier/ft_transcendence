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
          description: { type: ['string', 'null'] },
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
      description: { type: 'string', maxLength: 255 },
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

export const channelIdParamSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
}

export const updateChannelSchema = {
  params: channelIdParamSchema.params,
  body: {
    type: 'object',
    required: ['name'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: ['string', 'null'] },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const removeMemberParamSchema = {
  params: {
    type: 'object',
    required: ['id', 'userId'],
    properties: {
      id: { type: 'integer', minimum: 1 },
      userId: { type: 'integer', minimum: 1 },
    },
  },
}
