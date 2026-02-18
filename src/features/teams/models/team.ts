import { Type } from '@sinclair/typebox';

export const Team = Type.Object({
  id: Type.Integer(),
  name: Type.String(),
  shortName: Type.String(),
  country: Type.String(),
  logoUrl: Type.Union([Type.String(), Type.Null()]),
  founded: Type.Union([Type.Integer(), Type.Null()]),
  stadium: Type.Union([Type.String(), Type.Null()]),
});
