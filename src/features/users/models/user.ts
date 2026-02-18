import { Type, type Static } from '@sinclair/typebox';

export const User = Type.Object({
  id: Type.Integer(),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
});

export type UserType = Static<typeof User>;
