import type { MatchStatus } from '@/features/matches/models/matchStatus.js';

export interface MatchDbModel {
  id: number;
  competitionId: number;
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
