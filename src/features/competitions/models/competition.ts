import { Type } from '@sinclair/typebox';

export const Competition = Type.Object({
  id: Type.Integer(),
  slug: Type.String(),
  name: Type.String(),
  country: Type.String(),
  priority: Type.Integer(),
  logoUrl: Type.Union([Type.String(), Type.Null()]),
});
