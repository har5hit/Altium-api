export const userProperties = {
  id: { type: 'integer' as const },
  email: { type: 'string' as const, format: 'email' },
  name: { type: 'string' as const },
  created_at: { type: 'string' as const, format: 'date-time' },
};

export const userResponse = {
  type: 'object' as const,
  properties: userProperties,
};

export const createUserBody = {
  type: 'object' as const,
  required: ['email', 'name'] as const,
  properties: {
    email: { type: 'string' as const, format: 'email' },
    name: { type: 'string' as const, minLength: 1 },
  },
};
