// Response shape for "my channels" (the current user's conversation list).
// Includes computed fields (hasUnread, memberCount) that aren't stored directly
// in the channels table but derived from other data at request time.
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
          avatarUrl: { type: ['string', 'null'] },
          createdAt: { type: 'string' },
          otherUserId: { type: 'integer' },
          writeMode: { type: 'string', enum: ['everyone', 'moderators_only'] },
          hasUnread: { type: 'boolean' },
          memberCount: { type: 'integer'}
        },
      },
    },
  },
}

// Body for creating a new channel. "name" is optional here because discussions
// don't need one (it's resolved from the other participant's pseudo instead).
export const createChannelSchema = {
  body: {
    type: 'object',
    required: ['memberIds', 'type'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 30 },
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

export const markChannelReadSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
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

// Response shape for the "discover channels" list (every channel, not just the
// caller's own). "isMember" lets the frontend show "Join" vs "Already a member".
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

// Shared params shape (just a channel id), reused by most routes below to avoid
// repeating the same object literal everywhere.
export const channelIdParamSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
}

export const listChannelMembersSchema = {
  params: channelIdParamSchema.params,
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'integer' },
          role: { type: 'string', enum: ['moderator', 'member'] },
        },
      },
    },
  },
}

export const updateChannelSchema = {
  params: channelIdParamSchema.params,
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 30 },
      description: { type: 'string', maxLength: 255 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: ['string', 'null'] },
        description: { type: ['string', 'null'] },
        avatarUrl: { type: ['string', 'null'] },
        type: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

// File is sent as multipart/form-data, not validated by this JSON schema (handled
// separately in the controller via request.file() ).
export const uploadChannelAvatarSchema = {
  params: channelIdParamSchema.params,
  response: {
    200: {
      type: 'object',
      properties: {
        avatarUrl: { type: ['string', 'null'] },
      },
    },
  },
}

export const deleteChannelAvatarSchema = {
  params: channelIdParamSchema.params,
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
}

// Distinct from channelIdParamSchema: this one also needs the target member's id
// in the URL (e.g. DELETE /:id/members/:userId).
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

export const addMemberSchema = {
  params: channelIdParamSchema.params,
  body: {
    type: 'object',
    required: ['memberIds'],
    additionalProperties: false,
    properties: {
      memberIds: {
        type: 'array',
        items: { type: 'integer', minimum: 1 },
        minItems: 1,
      },
    },
  },
}

export const updateMemberRoleSchema = {
  params: {
    type: 'object',
    required: ['id', 'userId'],
    properties: {
      id: { type: 'integer', minimum: 1 },
      userId: { type: 'integer', minimum: 1 },
    },
  },
  body: {
    type: 'object',
    required: ['role'],
    additionalProperties: false,
    properties: {
      role: { type: 'string', enum: ['moderator', 'member'] },
    },
  },
}

export const updateWriteModeSchema = {
  params: channelIdParamSchema.params,
  body: {
    type: 'object',
    required: ['writeMode'],
    additionalProperties: false,
    properties: {
      writeMode: { type: 'string', enum: ['everyone', 'moderators_only'] },
    },
  },
}