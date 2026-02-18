import { Type } from '@sinclair/typebox';
import { MatchStatus } from '@/features/matches/models/matchStatus.js';

export const Match = Type.Object({
  id: Type.Integer(),
  leagueId: Type.Integer(),
  utcKickoff: Type.String({ format: 'date-time' }),
  status: Type.Enum(MatchStatus),
  minute: Type.Union([Type.Integer(), Type.Null()]),
  homeTeamId: Type.Integer(),
  homeTeamName: Type.String(),
  awayTeamId: Type.Integer(),
  awayTeamName: Type.String(),
  homeScore: Type.Integer(),
  awayScore: Type.Integer(),
  venue: Type.Union([Type.String(), Type.Null()]),
});
