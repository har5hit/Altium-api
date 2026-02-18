import type UserRepository from '@/features/users/repositories/userRepository.js';
import { Type, type Static } from '@sinclair/typebox';
import { User } from '@/features/users/models/user.js';

export const CreateUserInputSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  name: Type.String({ minLength: 1 }),
});
export type CreateUserInput = Static<typeof CreateUserInputSchema>;

export const CreateUserOutputSchema = User;
export type CreateUserOutput = Static<typeof CreateUserOutputSchema>;

export default class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async invoke(input: CreateUserInput): Promise<CreateUserOutput> {
    return this.userRepository.create({ email: input.email, name: input.name });
  }
}
