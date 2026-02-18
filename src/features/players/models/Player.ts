import { Type } from '@sinclair/typebox';

export const Player = Type.Object({
  id: Type.Integer(),
  teamId: Type.Integer(),
  leagueId: Type.Union([Type.Integer(), Type.Null()]),
  name: Type.String(),
  shortName: Type.Union([Type.String(), Type.Null()]),
  position: Type.String(),
  jerseyNumber: Type.Union([Type.Integer(), Type.Null()]),
  dateOfBirth: Type.Union([Type.String({ format: 'date' }), Type.Null()]),
  nationality: Type.String(),
  heightCm: Type.Union([Type.Integer(), Type.Null()]),
  preferredFoot: Type.Union([Type.String(), Type.Null()]),
  photoUrl: Type.Union([Type.String(), Type.Null()]),
});
