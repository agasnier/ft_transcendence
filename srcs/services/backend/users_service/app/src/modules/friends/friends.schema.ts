// Shared params shape (just a target user id), reused by the three request-response routes.
export const sendFriendRequestSchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'integer', minimum: 1 },
    },
  },
}

export const acceptFriendRequestSchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'integer', minimum: 1 },
    },
  },
}

export const declineFriendRequestSchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'integer', minimum: 1 },
    },
  },
}

// "search" is optional: with no query, returns the full friends list.
export const listFriendsSchema = {
  querystring: {
    type: 'object',
    properties: {
      search: { type: 'string', maxLength: 50 },
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
          displayName: { type: ['string', 'null'] },
          avatarUrl: { type: 'string' },
        },
      },
    },
  },
}

export const removeFriendSchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'integer', minimum: 1 },
    },
  },
}

// Shared response item shape for both incoming and outgoing pending requests
// (same public user fields as a friend, no request-specific metadata needed).
const friendRequestUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    pseudo: { type: 'string' },
    displayName: { type: ['string', 'null'] },
    avatarUrl: { type: 'string' },
  },
}

export const listFriendRequestsSchema = {
  response: {
    200: {
      type: 'array',
      items: friendRequestUserSchema,
    },
  },
}