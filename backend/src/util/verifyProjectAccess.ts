import { ProjectMetadata } from '../types/ProjectMetadata';
import { firebaseAdmin } from '../admin';
import { Uid } from '../types/Uid';
import { ProjectId } from '../types/ProjectId';

export async function verifyProjectAccess(
  uid: Uid,
  projectId: ProjectId,
  requiredAccess: 'owner' | 'editor' = 'owner'
): Promise<void> {
  const projectMetadata: ProjectMetadata<Uid> = await firebaseAdmin
    .database()
    .ref(`projectMetadata/${projectId}`)
    .get()
    .then((data) => data.val() as ProjectMetadata<Uid>);

  if (projectMetadata.userRoles[uid] !== requiredAccess)
    throw new Error(`Only ${requiredAccess}s can perform this action`);
}
