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