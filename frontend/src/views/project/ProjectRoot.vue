<template>
  <div
    v-if="projectsState.currentProject"
    class="project"
  >
    <header>
      <h3>{{ projectsState.currentProject.metadata.name }}</h3>
      <p class="body-small">
        {{ projectId }}
      </p>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { syncCurrentProject, projectsState } from '@/store/projects';

export default defineComponent({
  name: 'Project',
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    syncCurrentProject(props.projectId);

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

    header {
      height: 13rem;
      border-bottom: 1px solid $colorGrey500;
      padding: 4rem;
    }

    main {
      padding: 4rem 4rem 0 4rem;
      height: 100%;
    }
  }
</style>
