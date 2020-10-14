<template>
  <div class="content">
    <h2 v-if="projectsState.currentProject.content">
      Content
    </h2>
    <div
      v-else
      class="no-schema"
    >
      <h2>
        You first need to define a schema for {{ projectsState.currentProject.metadata.name }}
      </h2>
      <Button
        class="button"
        :to="{
          name: 'ProjectSchema',
          params: { projectId: projectsState.currentProject.metadata.id }
        }"
      >
        Go to schema
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { projectsState } from '@/store/projects';
import Button from '@/components/Button.vue';

export default defineComponent({
  name: 'Content',
  components: {
    Button,
  },
  setup() {
    return {
      projectsState,
    };
  },
});
</script>

<style lang="scss" scoped>
  .content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    .no-schema {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .button {
        margin-top: 2rem;
      }
    }
  }
</style>
