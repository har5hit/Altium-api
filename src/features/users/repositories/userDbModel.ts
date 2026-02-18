export interface UserDbModel {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface CreateUserDbModel {
  email: string;
  name: string;
}
