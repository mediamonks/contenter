import { Locale } from './Locale';
import { ProjectId } from './ProjectId';
import { Uid } from './Uid';
import { Uri } from './Uri';
import { User } from './User';

export interface ProjectMetadata<T extends Uid | User> {
  name: string;
  id: ProjectId;
  locales?: ReadonlyArray<Locale>;
  users: ReadonlyArray<T>;
  relativeBasePath: Uri;
  userRoles: Record<string, 'owner' | 'editor'>;
}
