import type { SearchResultType } from '@/features/search/models/searchResult.js';

export interface SearchResultDbModel {
  type: SearchResultType;
  id: number;
  title: string;
  subtitle: string | null;
  meta: string | null;
}
