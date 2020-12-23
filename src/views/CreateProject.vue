<template>
  <div class="create-project">
    <main>
      <form @submit.prevent="handleFormSubmit">
        <TextField v-model="name"
label="Project Name" placeholder="Name" />
        <TextField v-model="id"
label="ID" placeholder="some-id" :error="idError" />
        <SearchSelector
          label="Users"
          placeholder="Search for a name"
          @update-users="updateSelectedUsers"
        />
        <Button :is-loading="isLoading"> Create </Button>
      </form>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import Button from '@/components/Button.vue';
import TextField from '@/components/TextField.vue';
import SearchSelector from '@/components/SearchSelector.vue';
import { createNewProject, projectsState, syncProjectsMetadata } from '@/store/projects';
import { User, userState } from '@/store/user';
import router, { RouteNames } from '@/router';
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
    const selectedUsers = ref<Array<User>>([]);

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
      } else if (/\s/.test(id.value)) {
        idError.value = 'Spaces are not allowed';
      } else {
        idError.value = '';
      }
    });

    function handleFormSubmit() {
      if (!userState.currentUser) throw displayError(new Error('No user defined'));
      isLoading.value = true;
      return createNewProject(name.value, id.value, userState.currentUser.uid, selectedUsers.value)
        .then(() => {
          router.push({ name: RouteNames.HOME });
        })
        .catch((error) => {
          displayError(error);
        })
        .then(() => {
          isLoading.value = false;
        });
    }

    function updateSelectedUsers(users: Array<User>) {
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
