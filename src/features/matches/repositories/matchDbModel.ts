import type { MatchStatus } from '@/features/matches/models/MatchStatus.js';

export interface MatchDbModel {
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
