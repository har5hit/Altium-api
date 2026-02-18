export interface PlayerDbModel {
  id: number;
  teamId: number;
  leagueId: number | null;
  name: string;
  shortName: string | null;
  position: string;
  jerseyNumber: number | null;
  dateOfBirth: string | null;
  nationality: string;
  heightCm: number | null;
  preferredFoot: string | null;
  photoUrl: string | null;
}
