import { Type } from '@sinclair/typebox';

export const StandingRow = Type.Object({
  position: Type.Integer(),
  teamId: Type.Integer(),
  teamName: Type.String(),
  played: Type.Integer(),
  won: Type.Integer(),
  draw: Type.Integer(),
  lost: Type.Integer(),
  goalsFor: Type.Integer(),
  goalsAgainst: Type.Integer(),
  goalDifference: Type.Integer(),
  points: Type.Integer(),
  form: Type.Union([Type.String(), Type.Null()]),
});
