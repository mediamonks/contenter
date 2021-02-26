<template>
  <div class="project">
    <template v-if="projectsState.currentProject">
      <router-view />
    </template>
    <div
      v-else
      class="loading"
    >
      <h1>Loading...</h1>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { setCurrentProject, projectsState, resetCurrentProjectState, ProjectId } from '@/store/projects';
import router, { RouteNames } from '@/router';
import { displayError } from '@/store/message';

export default defineComponent({
  name: 'Project',
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    setCurrentProject(props.projectId as ProjectId).catch((error) => {
      router.push({ name: RouteNames.HOME });
      displayError(error);
    });

    onUnmounted(async () => {
      await resetCurrentProjectState();
    });

    return {
      projectsState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';

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
