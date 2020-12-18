<template>
  <div class="schema">
    <ProjectBar>
      <Button
        class="button"
        :loading="loading"
        label-for="schema-file-selector"
        flat
      >
        Upload a JSON schema
      </Button>
    </ProjectBar>
    <main>
      <div v-if="currentProject.schemaURL">
        <h1>Schema</h1>
        <pre><code>{{ currentProjectSchema }}</code></pre>
      </div>
      <div
        v-else
        class="no-schema"
      >
        <h2>There is no schema defined for {{ currentProject.metadata.name }}</h2>
      </div>
    </main>
    <input
      id="schema-file-selector"
      ref="fileSelector"
      type="file"
      accept=".json"
      class="upload-input"
      @change="handleSchemaUpload"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { projectsState, uploadSchema } from '@/store/projects';
import ProjectBar from '@/components/ProjectBar.vue';
import Button from '@/components/Button.vue';
import { displayError } from '@/store/message';
import { loadFirebaseAnalytics } from '@/firebase';

export default defineComponent({
  name: 'Schema',
  components: {
    ProjectBar,
    Button,
  },
  setup() {
    const loading = ref(false);

    function handleSchemaUpload(event: InputEvent) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const [file]: File = event.target.files;

      if (!file || !projectsState.currentProject) return;
      loading.value = true;
      uploadSchema(file, projectsState.currentProject)
        .then(() => {
          loading.value = false;

          return loadFirebaseAnalytics();
        })
        .then((analytics) => {
          analytics.logEvent('uploadJSON', {
            projectId: projectsState.currentProject?.metadata?.id,
          });
        })
        .catch((error) => {
          loading.value = false;
          displayError(error);
        });
    }

    return {
      currentProject: projectsState.currentProject,
      currentProjectSchema: projectsState.currentProjectSchema,
      loading,
      handleSchemaUpload,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/variables';

  .schema {
    height: 100%;

    main {
      height: calc(100% - 13rem);
      width: calc(100vw - 38rem);
      padding: 4rem;

      pre {
        padding: 2rem;
        background: $colorGrey800;
        color: $colorGrey050;
        border-radius: 1rem;
        overflow-y: auto;
        overflow-x: auto;
        max-height: 70vh;
      }
    }

    .upload-input {
      display: none;
    }

    .no-schema {
      display: flex;
      flex-direction: column;
      align-items: center;

      .button {
        margin-top: 2rem;
      }
    }
  }
</style>
