<template>
  <div class="project-settings">
    <ProjectBar />
    <main>
      <h2>Settings</h2>
      <form @submit.prevent="handleSavingChanges">
        <div class="input-wrapper">
          <TextField
            v-model="formState.name"
            label="Name"
            :placeholder="projectsState.currentProject.metadata.name"
          />
          <p class="body-small">
            Please note that you cannot change the ID of a project. The ID of this project will
            remain <code>{{ projectsState.currentProject.metadata.id }}</code>
          </p>
        </div>
        <div
          v-if="projectsState.currentProject.metadata.users.length > 1"
          class="input-wrapper"
        >
          <h4>Users</h4>
          <ul class="user-list">
            <template
              v-for="user in projectsState.currentProject.metadata.users"
              :key="`user-id=${user.uid}`"
            >
              <li
                v-if="user.uid !== userState.currentUser.uid"
                class="user-item"
              >
                <Avatar
                  :image="user.photoURL"
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
        <Button
          type="submit"
          :disabled="!isChanged"
          :loading="isLoading"
        >
          Save changes
        </Button>
      </form>
    </main>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, reactive, ref, watch,
} from 'vue';
import ProjectBar from '@/components/ProjectBar.vue';
import TextField from '@/components/TextField.vue';
import Avatar from '@/components/Avatar.vue';
import Trash from '@/assets/icons/Trash.vue';
import SearchSelector from '@/components/SearchSelector.vue';
import Button from '@/components/Button.vue';
import { projectsState, updateProjectsMetadata } from '@/store/projects';
import { userState, User, updateUser } from '@/store/user';
import { displayError } from '@/store/error';

interface ProjectSettingsFormState {
  name: string | null;
  users: User[] | null;
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
    });
    const isChanged = ref(false);
    const isLoading = ref(false);
    const searchSelector = ref<typeof SearchSelector | null>(null);

    watch(formState, (oldValue, newValue) => {
      if (!newValue.name) return;
      if (!projectsState.currentProject || !projectsState.currentProject.metadata) return;
      const { metadata } = projectsState.currentProject;
      if (metadata.name === newValue.name) return;

      isChanged.value = true;
      console.log(newValue.name, projectsState.currentProject.metadata.name);
    });

    if (projectsState.currentProject && projectsState.currentProject.metadata) {
      const { metadata } = projectsState.currentProject;
      formState.name = metadata.name;
      formState.users = metadata.users;
    }

    function updateSelectedUsers(users: User[]) {
      formState.users = users;
      isChanged.value = true;
    }

    function handleSavingChanges() {
      if (!projectsState.currentProject || !projectsState.currentProject.metadata) throw new Error('No current project defined');
      isLoading.value = true;

      const currentMetadata = projectsState.currentProject.metadata;

      updateProjectsMetadata({
        ...currentMetadata,
        name: formState.name ? formState.name : currentMetadata.name,
        users:
          formState.users
            ? [...new Set([...formState.users, ...currentMetadata.users])]
            : [...currentMetadata.users],
      }).then((newMetadata) => Promise.all(newMetadata.users.map((user) => {
        let projects: string[] = [];

        if (user.projects) {
          projects = user.projects;
        }

        return updateUser({
          ...user,
          projects: [...new Set([...projects, newMetadata.id])],
        });
      })))
        .then(() => {
          isLoading.value = false;
          isChanged.value = false;

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
      isChanged.value = true;
    }

    return {
      projectsState,
      userState,
      searchSelector,
      isChanged,
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
    }
  }
}
</style>