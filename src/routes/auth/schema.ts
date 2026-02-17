import { userResponse } from '../../schemas/userSchema.js';

export const lookupSchema = {
  body: {
    type: 'object' as const,
    required: ['email'] as const,
    properties: {
      email: { type: 'string' as const, format: 'email' },
    },
  },
  response: { 200: userResponse },
};
