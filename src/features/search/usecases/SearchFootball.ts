import { Type, type Static } from '@sinclair/typebox';
import { SearchResult } from '@/features/search/models/searchResult.js';
import type SearchRepository from '@/features/search/repositories/SearchRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const SearchFootballInputSchema = Type.Object({
  q: Type.String({ minLength: 2, maxLength: 120 }),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 30, default: 15 })),
});
export type SearchFootballInput = Static<typeof SearchFootballInputSchema>;

export const SearchFootballOutputSchema = Type.Array(SearchResult);
export type SearchFootballOutput = Static<typeof SearchFootballOutputSchema>;

export default class SearchFootball {
  constructor(
    private readonly repository: SearchRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: SearchFootballInput): Promise<SearchFootballOutput> {
    const limit = input.limit ?? 15;
    const query = input.q.trim().toLowerCase();
    const key = `football:search:${query}:${limit}`;
    return getOrSetCached(this.cache, key, 30, () => this.repository.search(query, limit));
  }
}
