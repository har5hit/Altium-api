export const idParam = {
  type: 'object' as const,
  properties: {
    id: { type: 'integer' as const },
  },
  required: ['id'] as const,
};

export const messageResponse = {
  type: 'object' as const,
  properties: {
    message: { type: 'string' as const },
  },
};

export const paginationQuery = {
  type: 'object' as const,
  properties: {
    page: { type: 'integer' as const, minimum: 1, default: 1 },
    limit: { type: 'integer' as const, minimum: 1, maximum: 100, default: 20 },
  },
};
