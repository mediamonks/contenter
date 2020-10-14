<template>
  <div
    v-if="projectsState.currentProject"
    class="project"
  >
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { syncCurrentProject, projectsState, resetCurrentProject } from '@/store/projects';

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
      .catch((err) => console.error(err));

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
  }
</style>
