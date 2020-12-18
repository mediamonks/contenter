<template>
  <div class="create-project">
    <main>
      <form @submit.prevent="handleFormSubmit">
        <TextField
          v-model="name"
          label="Project Name"
          placeholder="Name"
        />
        <TextField
          v-model="id"
          label="ID"
          placeholder="some-id"
          :error="idError"
        />
        <SearchSelector
          label="Users"
          placeholder="Search for a name"
          @update-users="updateSelectedUsers"
        />
        <Button :loading="isLoading">
          Create
        </Button>
      </form>
    </main>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  ref,
} from 'vue';
import Button from '@/components/Button.vue';
import TextField from '@/components/TextField.vue';
import SearchSelector from '@/components/SearchSelector.vue';
import { createNewProject, projectsState, syncProjectsMetadata } from '@/store/projects';
import { User, userState } from '@/store/user';
import router from '@/router';
import { displayError } from '@/store/message';
import { loadFirebaseAnalytics } from '@/firebase';

export default defineComponent({
  name: 'CreateProject',
  components: {
    Button,
    TextField,
    SearchSelector,
  },
  setup() {
    const name = ref('');
    const id = ref('');
    const selectedUsers = ref<User[]>([]);

    const isLoading = ref(false);

    const idError = ref('');

    watch(name, () => {
      id.value = name.value.toLowerCase().split(' ').join('-');
    });

    watch(id, async () => {
      if (projectsState.projectIds && projectsState.projectIds.length === 0) {
        await syncProjectsMetadata();
      }

      if (projectsState.projectIds.includes(id.value)) {
        idError.value = 'ID already exists';
        // TODO: use .includes(' ')
        // Or /\s/.test(id.value) so you also check for new lines, tabs etc.
      } else if (id.value.split(' ').length > 1) {
        idError.value = 'Spaces are not allowed';
      } else {
        idError.value = '';
      }
    });

    function handleFormSubmit() {
      if (!userState.currentUser) return;
      isLoading.value = true;
      // TODO: return this
      createNewProject(
        name.value,
        id.value,
        userState.currentUser.uid,
        selectedUsers.value,
      )
        .then(() => {
          router.push('/');
          isLoading.value = false;
        })
        .catch((error) => {
          displayError(error);
          isLoading.value = false;
        });
    }

    // TODO: Array<User>
    function updateSelectedUsers(users: User[]) {
      selectedUsers.value = users;
    }

    loadFirebaseAnalytics().then((analytics) => {
      analytics.logEvent('project_creation_start');
    });

    return {
      handleFormSubmit,
      updateSelectedUsers,
      idError,
      name,
      id,
      isLoading,
      selectedUsers,
    };
  },
});
</script>

<style lang="scss" scoped>
  .create-project {
    main {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;

      form {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        width: 100%;
        max-width: 60rem;

        > * {
          margin-top: 5rem;
        }
      }
    }
  }
</style>
