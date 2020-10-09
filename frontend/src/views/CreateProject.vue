<template>
  <div class="create-project">
    <header>
      <h3>Create a new project</h3>
      <Button
        to="/"
        flat
      >
        Cancel
      </Button>
    </header>
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
        <Button>Create</Button>
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
import { createNewProject, projectIds, syncProjects } from '@/store/projects';
import { userState } from '@/store/user';
import router from '@/router';

export default defineComponent({
  name: 'CreateProject',
  components: {
    Button,
    TextField,
  },
  setup() {
    const name = ref('');
    const id = ref('');

    const isLoading = ref(false);

    const idError = ref('');

    watch(name, () => {
      id.value = name.value.toLowerCase().split(' ').join('-');
    });

    watch(id, async () => {
      if (projectIds.value.length === 0) {
        await syncProjects();
      }

      if (projectIds.value.includes(id.value)) {
        idError.value = 'ID already exists';
      } else if (id.value.split(' ').length > 1) {
        idError.value = 'Spaces are not allowed';
      } else {
        idError.value = '';
      }
    });

    function handleFormSubmit() {
      if (!userState.currentUser) return;
      isLoading.value = true;
      createNewProject(name.value, id.value, userState.currentUser.uid)
        .then(() => {
          router.push('/');
          isLoading.value = false;
        })
        .catch((err) => {
          console.error(err);
          isLoading.value = false;
        });
    }

    return {
      handleFormSubmit,
      idError,
      name,
      id,
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
  .create-project {
    header {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      padding: 4rem;
      position: absolute;
    }

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
