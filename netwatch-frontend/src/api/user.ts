import { createAuthenticatedClient } from './client';
import type { User } from '../types';

export const userApi = {
  // Get current authenticated user information
  getCurrentUser: async (token: string): Promise<User> => {
    const client = createAuthenticatedClient(token);
    const response = await client.get<User>('/users/me');
    return response.data;
  },
};
