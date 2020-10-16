<template>
  <div class="project">
    <template v-if="projectsState.currentProject">
      <router-view />
    </template>
    <div
      v-else
      class="loading"
    >
      <h2>Loading...</h2>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { syncCurrentProject, projectsState, resetCurrentProject } from '@/store/projects';
import router from '@/router';
import { displayError } from '@/store/error';

export default defineComponent({
  name: 'Project',
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    syncCurrentProject(props.projectId)
      .catch((error) => {
        router.push('/');
        displayError(error);
      });

    onUnmounted(async () => {
      await resetCurrentProject();
    });

    return {
      projectsState,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import "~@/assets/scss/variables";

  .project {
    display: flex;
    flex-direction: column;
    height: 100vh;

    .loading {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
    }
  }
</style>
