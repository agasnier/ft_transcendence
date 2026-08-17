export const uploadFileSchema = {
  params: {
    type: 'object',
    required: ['channelId'],
    properties: {
      channelId: { type: 'integer', minimum: 1 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        channelId: { type: 'integer' },
        uploaderId: { type: 'integer' },
        originalName: { type: 'string' },
        mimeType: { type: 'string' },
        size: { type: 'integer' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const fileIdParamSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 },
    },
  },
}