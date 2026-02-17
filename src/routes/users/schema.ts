import { userResponse, createUserBody } from '../../schemas/userSchema.js';
import { idParam, paginationQuery, messageResponse } from '../../schemas/commonSchema.js';

export const getUsersSchema = {
  querystring: paginationQuery,
  response: { 200: { type: 'array' as const, items: userResponse } },
};

export const getUserSchema = {
  params: idParam,
  response: { 200: userResponse },
};

export const createUserSchema = {
  body: createUserBody,
  response: { 201: userResponse },
};

export const deleteUserSchema = {
  params: idParam,
  response: { 200: messageResponse },
};
