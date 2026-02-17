import { NotFoundError } from '../utils/errors.js';
import type UserRepository from '../repositories/userRepository.js';
import type { User, CreateUserInput } from '../types.js';

export default class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getUsers({ page = 1, limit = 20 }): Promise<User[]> {
    const offset = (page - 1) * limit;
    return this.userRepository.findAll({ limit, offset });
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async createUser(data: CreateUserInput): Promise<User> {
    return this.userRepository.create(data);
  }

  async deleteUser(id: number): Promise<void> {
    const deleted = await this.userRepository.deleteById(id);
    if (!deleted) throw new NotFoundError('User not found');
  }
}
