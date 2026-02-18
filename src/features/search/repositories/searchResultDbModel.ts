export interface SearchResultDbModel {
  type: 'team' | 'competition' | 'match';
  id: number;
  title: string;
  subtitle: string | null;
  meta: string | null;
}
