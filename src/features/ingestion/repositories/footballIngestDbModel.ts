import type { MatchStatus } from '@/features/matches/models/matchStatus.js';

export interface VendorLeagueDbModel {
  id: number;
  slug: string;
  name: string;
  country: string;
  priority: number;
  logoUrl: string | null;
}

export interface VendorTeamDbModel {
  id: number;
  name: string;
  shortName: string;
  country: string;
  logoUrl: string | null;
  founded: number | null;
  stadium: string | null;
}

export interface VendorMatchDbModel {
  id: number;
  leagueId: number;
  utcKickoff: string;
  status: MatchStatus;
  minute: number | null;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  venue: string | null;
}

export interface VendorStandingsRowDbModel {
  leagueId: number;
  season: string;
  position: number;
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
}
