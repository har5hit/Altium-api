import { Type } from '@sinclair/typebox';

export enum SearchResultType {
  TEAM = 'team',
  LEAGUE = 'league',
  MATCH = 'match',
}

export const SearchResult = Type.Object({
  type: Type.Enum(SearchResultType),
  id: Type.Integer(),
  title: Type.String(),
  subtitle: Type.Union([Type.String(), Type.Null()]),
  meta: Type.Union([Type.String(), Type.Null()]),
});
