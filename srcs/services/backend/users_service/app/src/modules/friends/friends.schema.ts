import { kMaxLength } from "node:buffer"

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
    required: ['usersId'],
    properties: {
      userId: { type: 'integer', minimum: 1 },
    },
  },
}

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
          isOnline: { type: 'boolean' },
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