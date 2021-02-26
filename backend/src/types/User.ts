import { Uri } from './Uri';
import { Uid } from './Uid';
import { ProjectId } from './ProjectId';
import { Email } from './Email';

export interface User {
  uid: Uid;
  displayName: string;
  email: Email;
  photoUrl: Uri;
  /**
   * @deprecated
   */
  projectIds?: ReadonlyArray<ProjectId>;
  role?: 'editor' | 'developer' | 'admin';
}
