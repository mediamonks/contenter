import type { ProjectId } from './store/projects';
import type { User } from './store/user';
import { loadFirebaseAuth } from './firebase';

let apiUrl = 'https://us-central1-mm-content-manager.cloudfunctions.net/api';

if (process.env.NODE_ENV === 'development') {
  apiUrl = 'http://localhost:5001/mm-content-manager/us-central1/api';
}

export async function createProject(params: {
  name: string;
  id: ProjectId;
  user: User;
  users: Array<User>;
}): Promise<string> {
  const userToken = await (await loadFirebaseAuth()).currentUser?.getIdToken(true);
  if (!userToken) throw new Error('No user token available');

  const response = await fetch(`${apiUrl}/create-project`, {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      id: params.id,
      uid: params.user.uid,
      userToken,
      users: params.users,
      currentUserProjectIds: params.user.projectIds ?? [],
    }),
  });

  const result: {
    success: boolean;
    message: string;
  } = await response.json();

  if (result.success === false) throw new Error(result.message);

  return result.message;
}
