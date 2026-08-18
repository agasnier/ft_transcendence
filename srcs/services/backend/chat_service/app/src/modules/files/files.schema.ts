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
        senderId: { type: 'integer' },
        senderPseudo: { type: ['string', 'null'] },
        content: { type: 'string' },
        createdAt: { type: 'string' },
        type: { type: 'string', enum: ['user', 'system'] },
        fileId: { type: ['integer', 'null'] },
        file: {
          type: ['object', 'null'],
          properties: {
            id: { type: 'integer' },
            originalName: { type: 'string' },
            mimeType: { type: 'string' },
            size: { type: 'integer' },
          },
        },
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