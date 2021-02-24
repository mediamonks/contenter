import { Uri } from '@/types/Uri';
import type { UserToken } from '@/types/UserToken';
import { loadFirebaseAuth } from '@/firebase';
import axios from 'axios';

export const apiUrl = (process.env.NODE_ENV === 'development'
  ? 'http://localhost:5001/mm-content-manager/us-central1/api'
  : 'https://us-central1-mm-content-manager.cloudfunctions.net/api') as Uri;

export async function getUserToken(): Promise<UserToken> {
  const userToken = await (await loadFirebaseAuth()).currentUser?.getIdToken(true);
  if (!userToken) throw new Error('No user token available');

  return userToken as UserToken;
}

export const api = axios.create({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  baseURL: apiUrl,
});

api.interceptors.response.use(
  (response) => response,
  (response: {
    data?: {
      error?: {
        code: string;
        message: string;
      };
    };
  }) => {
    if (response.data?.error?.message) return new Error(response.data.error.message);
    return new Error('An unexpected error occurred');
  },
);
