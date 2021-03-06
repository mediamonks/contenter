<template>
  <div class="project-settings">
    <ProjectBar />
    <main>
      <h1>Settings</h1>
      <form @submit.prevent="handleSavingChanges">
        <div class="input-wrapper">
          <TextField
            v-model="formState.name"
            label="Name"
            :placeholder="currentProject.metadata.name"
          />
          <p class="body-small">
            Please note that you cannot change the ID of a project. The ID of this project will
            remain <code>{{ currentProject.metadata.id }}</code>
          </p>
        </div>
        <div
          v-if="currentProject.metadata.users.length > 1"
          class="input-wrapper"
        >
          <label>Users</label>
          <ul class="user-list">
            <template
              v-for="user in currentProject.metadata.users"
              :key="`user-id=${user.uid}`"
            >
              <li
                v-if="user.uid !== userState.currentUser.uid"
                class="user-item"
              >
                <Avatar
                  :image="user.photoUrl"
                  :name="user.displayName"
                />
                <button @click="deleteUserFromProject(user.uid)">
                  <Trash />
                </button>
              </li>
            </template>
          </ul>
        </div>
        <SearchSelector
          ref="searchSelector"
          label="Users"
          placeholder="Search for a name"
          @update-users="updateSelectedUsers"
        />
        <TextField
          v-model="formState.assetBasePath"
          label="Asset relative base path"
          placeholder="/static/img/"
        />
        <Button
          type="submit"
          :is-loading="isLoading"
        >
          Save changes
        </Button>
      </form>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRaw } from 'vue';
import ProjectBar from '@/components/ProjectBar.vue';
import TextField from '@/components/TextField.vue';
import Avatar from '@/components/Avatar.vue';
import Trash from '@/assets/icons/Trash.vue';
import SearchSelector from '@/components/SearchSelector.vue';
import Button from '@/components/Button.vue';
import { ProjectMetadata, projectsState, updateProjectsMetadata } from '@/store/projects';
import { userState, User } from '@/store/user';
import { displayError } from '@/store/message';
import { Uri } from '@/types/Uri';

interface ProjectSettingsFormState {
  name: string | null;
  users: Array<User> | null;
  assetBasePath: Uri | null;
}

export default defineComponent({
  name: 'ProjectSettings',
  components: {
    ProjectBar,
    TextField,
    Avatar,
    Trash,
    SearchSelector,
    Button,
  },
  setup() {
    const formState = reactive<ProjectSettingsFormState>({
      name: null,
      users: null,
      assetBasePath: null,
    });
    const isLoading = ref(false);
    const searchSelector = ref<typeof SearchSelector | null>(null);

    if (projectsState.currentProject && projectsState.currentProject.metadata) {
      const { metadata } = projectsState.currentProject;
      formState.name = metadata.name;
      formState.users = metadata.users as Array<User>;
      formState.assetBasePath = metadata.relativeBasePath || null;
    }

    function updateSelectedUsers(users: User[]) {
      formState.users = users;
    }

    function handleSavingChanges() {
      if (!projectsState.currentProject || !projectsState.currentProject.metadata) throw new Error('No current project defined');
      isLoading.value = true;

      const currentMetadata: ProjectMetadata<User> = projectsState.currentProject.metadata;

      const newMetadata = {
        ...currentMetadata,
        name: formState.name || currentMetadata.name,
        relativeBasePath: formState.assetBasePath || (currentMetadata.relativeBasePath as Uri),
      };

      let users = toRaw(formState).users as (ReadonlyArray<User> | null);
      if (users !== projectsState.currentProject.metadata.users && users) {
        users = [...users, toRaw(userState.currentUser)] as ReadonlyArray<User>;
      }

      if (users) {
        newMetadata.userRoles = users.reduce((accumulator, user) => ({
          ...accumulator,
          [user.uid]: currentMetadata.userRoles[user.uid] ?? 'editor',
        }), {});
      }

      updateProjectsMetadata(newMetadata)
        .then(() => {
          isLoading.value = false;

          if (searchSelector.value) {
            searchSelector.value.resetFields();
          }
        })
        .catch((error) => displayError(error));
    }

    function deleteUserFromProject(uid: string) {
      if (!formState.users) throw displayError(new Error('This project has no other users'));

      const [user] = formState.users.filter((item) => item.uid === uid);
      const index = formState.users.indexOf(user);
      if (index <= -1) throw displayError(new Error('This project has no other users'));

      formState.users.splice(index, 1);
    }

    return {
      currentProject: projectsState.currentProject,
      userState,
      searchSelector,
      isLoading,
      formState,
      updateSelectedUsers,
      handleSavingChanges,
      deleteUserFromProject,
    };
  },
});
</script>

<style lang="scss">
@import '~@/assets/scss/variables';

.project-settings {
  > main {
    padding: 4rem;

    form {
      max-width: 64rem;
      margin-top: 3rem;

      .input-wrapper {
        margin-bottom: 3rem;

        .body-small {
          margin-top: 1rem;
        }
      }

      .user-list {
        list-style: none;

        .user-item {
          display: flex;
          justify-content: space-between;

          &:not(:last-child) {
            margin-bottom: 2rem;
          }

          button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;

            .icon {
              width: 5rem;
              height: 5rem;
              background: transparent;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 100%;
              transition: 0.2s ease-out;
              color: $colorGrey500;

              svg {
                width: 40%;
                height: 100%;
              }
            }

            &:hover {
              .icon {
                background: lighten($colorError, 40);
                color: $colorError;
              }
            }
          }
        }
      }

      button[type='submit'] {
        margin-top: 3rem;
      }
    }
  }
}
</style>
