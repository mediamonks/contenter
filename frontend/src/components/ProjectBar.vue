<template>
  <header class="project-bar">
    <header>
      <h3>{{ projectsState.currentProject.metadata.name }}</h3>
      <p class="body-small">
        <template v-if="subtitle">
          {{ subtitle }}
        </template>
        <template v-else>
          {{ projectsState.currentProject.metadata.id }}
        </template>
      </p>
    </header>
    <main>
      <slot name="main" />
    </main>
    <aside>
      <slot />
    </aside>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { projectsState } from '@/store/projects';

export default defineComponent({
  name: 'ProjectBar',
  props: {
    subtitle: {
      type: String,
      default: null,
    },
  },
  setup() {
    return {
      projectsState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';
@import '~seng-scss';

.project-bar {
  position: sticky;
  top: 0;
  background: $colorGrey050;
  z-index: zindex($zLayout, projectBar);
  height: 13rem;
  width: 100%;
  border-bottom: 1px solid $colorGrey500;
  padding: 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  aside {
    display: flex;
  }
}
</style>
