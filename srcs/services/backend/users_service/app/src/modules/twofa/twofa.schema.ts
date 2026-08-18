const codeBody = {
  type: 'object',
  required: ['code'],
  additionalProperties: false,
  properties: {
    code: { type: 'string', minLength: 6, maxLength: 6, pattern: '^[0-9]{6}$' },
  },
}

export const verifySchema = {
  body: codeBody,
}

export const disableSchema = {
  body: codeBody,
}
