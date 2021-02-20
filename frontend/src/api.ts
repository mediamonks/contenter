import { Uri } from '@/types/Uri';
import type { UserToken } from '@/types/UserToken';
import { loadFirebaseAuth } from '@/firebase';

export function getApiUrl(): Uri {
  let apiUrl = 'https://us-central1-mm-content-manager.cloudfunctions.net/api' as Uri;

  if (process.env.NODE_ENV === 'development') {
    apiUrl = 'http://localhost:5001/mm-content-manager/us-central1/api' as Uri;
  }

  return apiUrl;
}

export async function getUserToken(): Promise<UserToken> {
  const userToken = await (await loadFirebaseAuth()).currentUser?.getIdToken(true);
  if (!userToken) throw new Error('No user token available');

  return userToken as UserToken;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const api = {
  get: async <T>(uri: Uri): Promise<ApiResponse<T>> => {
    const response: ApiResponse<T> = await (
      await fetch(getApiUrl + uri, {
        method: 'GET',
      })
    ).json();

    if (response.success === false) throw new Error(response.message);
    return response;
  },
  post: async <T, K>(uri: Uri, params: T): Promise<ApiResponse<K>> => {
    const response: ApiResponse<K> = await (
      await fetch(getApiUrl() + uri, {
        method: 'POST',
        body: JSON.stringify(params),
      })
    ).json();

    if (response.success === false) throw new Error(response.message);
    return response;
  },
};
