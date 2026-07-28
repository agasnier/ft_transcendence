export const listUserChannelsSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
  },
}
