export interface CompetitionDbModel {
  id: number;
  slug: string;
  name: string;
  country: string;
  priority: number;
  logoUrl: string | null;
}
