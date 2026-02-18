import { NotFoundError } from '@/app/errors.js';
import type UserRepository from '@/features/users/repositories/UserRepository.js';
import { Type, type Static } from '@sinclair/typebox';

export const DeleteUserInputSchema = Type.Object({
  id: Type.Integer(),
});
export type DeleteUserInput = Static<typeof DeleteUserInputSchema>;

export const DeleteUserOutputSchema = Type.Object({
  message: Type.String(),
});
export type DeleteUserOutput = Static<typeof DeleteUserOutputSchema>;

export default class DeleteUser {
  constructor(private readonly userRepository: UserRepository) {}

  async invoke(input: DeleteUserInput): Promise<DeleteUserOutput> {
    const deleted = await this.userRepository.deleteById(input.id);
    if (!deleted) throw new NotFoundError('User not found');
    return { message: 'User deleted' };
  }
}
