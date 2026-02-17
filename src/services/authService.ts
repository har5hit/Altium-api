import { NotFoundError } from '../utils/errors.js';
import type AuthRepository from '../repositories/authRepository.js';
import type { User } from '../types.js';

export default class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async lookupByEmail(email: string): Promise<User> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
