import type UserRepository from '@/features/users/repositories/UserRepository.js';
import { Type, type Static } from '@sinclair/typebox';
import { User } from '@/features/users/models/user.js';

export const GetUsersInputSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
});
export type GetUsersInput = Static<typeof GetUsersInputSchema>;

export const GetUsersOutputSchema = Type.Array(User);
export type GetUsersOutput = Static<typeof GetUsersOutputSchema>;

export default class GetUsers {
  constructor(private readonly userRepository: UserRepository) {}

  async invoke(input: GetUsersInput): Promise<GetUsersOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const offset = (page - 1) * limit;
    return this.userRepository.findAll({ limit, offset });
  }
}
