import { Type } from '@sinclair/typebox';

export const SearchResult = Type.Object({
  type: Type.Union([Type.Literal('team'), Type.Literal('competition'), Type.Literal('match')]),
  id: Type.Integer(),
  title: Type.String(),
  subtitle: Type.Union([Type.String(), Type.Null()]),
  meta: Type.Union([Type.String(), Type.Null()]),
});
