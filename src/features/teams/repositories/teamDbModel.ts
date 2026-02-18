export interface TeamDbModel {
  id: number;
  name: string;
  shortName: string;
  country: string;
  logoUrl: string | null;
  founded: number | null;
  stadium: string | null;
}
