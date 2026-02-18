import { NotFoundError } from '@/app/errors.js';
import type UserRepository from '@/features/users/repositories/userRepository.js';
import { Type, type Static } from '@sinclair/typebox';
import { User } from '@/features/users/models/user.js';

export const GetUserByIdInputSchema = Type.Object({
  id: Type.Integer(),
});
export type GetUserByIdInput = Static<typeof GetUserByIdInputSchema>;

export const GetUserByIdOutputSchema = User;
export type GetUserByIdOutput = Static<typeof GetUserByIdOutputSchema>;

export default class GetUserById {
  constructor(private readonly userRepository: UserRepository) {}

  async invoke(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
    const user = await this.userRepository.findById(input.id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
