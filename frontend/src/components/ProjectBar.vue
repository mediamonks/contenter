<template>
  <header class="project-bar">
    <main>
      <h3>{{ projectsState.currentProject.metadata.name }}</h3>
      <p class="body-small">
        {{ projectsState.currentProject.metadata.id }}
      </p>
    </main>
    <aside>
      <slot />
    </aside>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { projectsState } from '../store/projects';

export default defineComponent({
  name: 'ProjectBar',
  setup() {
    return {
      projectsState,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/variables';

  .project-bar {
    height: 13rem;
    border-bottom: 1px solid $colorGrey500;
    padding: 4rem;
    display: flex;
    justify-content: space-between;

    aside {
      display: flex;
    }
  }
</style>
