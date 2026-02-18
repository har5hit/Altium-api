import type { FastifyInstance } from 'fastify';
import { makeUserController } from '@/features/users/controllers/userController.js';
import { CreateUserInputSchema, CreateUserOutputSchema } from '@/features/users/usecases/CreateUser.js';
import { GetUsersInputSchema, GetUsersOutputSchema } from '@/features/users/usecases/GetUsers.js';
import { GetUserByIdInputSchema, GetUserByIdOutputSchema } from '@/features/users/usecases/GetUserById.js';
import { DeleteUserInputSchema, DeleteUserOutputSchema } from '@/features/users/usecases/DeleteUser.js';

const getUsersSchema = {
  querystring: GetUsersInputSchema,
  response: { 200: GetUsersOutputSchema },
};

const getUserSchema = {
  params: GetUserByIdInputSchema,
  response: { 200: GetUserByIdOutputSchema },
};

const createUserSchema = {
  body: CreateUserInputSchema,
  response: { 201: CreateUserOutputSchema },
};

const deleteUserSchema = {
  params: DeleteUserInputSchema,
  response: { 200: DeleteUserOutputSchema },
};

export default async function userRoutes(fastify: FastifyInstance) {
  const controller = makeUserController(fastify);

  fastify.get('/', { schema: getUsersSchema }, controller.getUsers);
  fastify.get('/:id', { schema: getUserSchema }, controller.getUser);
  fastify.post('/', { schema: createUserSchema }, controller.createUser);
  fastify.delete('/:id', { schema: deleteUserSchema }, controller.deleteUser);
}
