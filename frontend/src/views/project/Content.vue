<template>
  <div class="content">
    <ProjectBar>
      <Button
        flat
        @click="exportToJSON"
      >
        Export to JSON
      </Button>
    </ProjectBar>
    <main v-if="projectsState.currentProject.schemaURL">
      <div
        ref="jsonEditor"
        class="json-editor"
      />
    </main>
    <main
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
    </main>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, onMounted, watch,
} from 'vue';
import { projectsState, updateProject } from '@/store/projects';
import ProjectBar from '@/components/ProjectBar.vue';
import Button from '@/components/Button.vue';

export default defineComponent({
  name: 'Content',
  components: {
    Button,
    ProjectBar,
  },
  setup() {
    const jsonEditor = ref<HTMLDivElement | null>(null);
    const contentData = ref<object | null>(null);
    let editor: any = null;

    onMounted(async () => {
      if (!jsonEditor.value) return;
      const { JSONEditor } = await import(/* webpackChunkName: "JSONEditor" */'@json-editor/json-editor');

      editor = new JSONEditor(jsonEditor.value, {
        schema: projectsState.currentProjectSchema,
      });

      if (projectsState.currentProject?.content) {
        editor.setValue(projectsState.currentProject?.content);
      }

      editor.on('change', () => {
        contentData.value = editor.getValue();

        if (!projectsState.currentProject) return;
        if (!projectsState.currentProject.metadata) return;

        const currentData = { ...projectsState.currentProject };
        delete currentData.metadata;

        const newData = {
          ...currentData,
          content: editor.getValue(),
        };

        updateProject(projectsState.currentProject.metadata.id, newData);
      });
    });

    watch(projectsState, () => {
      if (!projectsState.currentProject) return;
      if (!projectsState.currentProject.content) return;
      if (!editor) return;

      editor.setValue(projectsState.currentProject.content);
    });

    function exportToJSON() {
      if (!projectsState.currentProject) return;
      if (!projectsState.currentProject.content) return;

      const { content } = projectsState.currentProject;
      const dataString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(content))}`;
      const anchorNode = document.createElement('a');
      anchorNode.setAttribute('style', 'display: hidden;');
      anchorNode.setAttribute('href', dataString);
      anchorNode.setAttribute('download', 'content.json');
      document.body.appendChild(anchorNode);
      anchorNode.click();
      anchorNode.remove();
    }

    return {
      projectsState,
      jsonEditor,
      exportToJSON,
    };
  },
});
</script>

<style lang="scss" scoped>
  .content {
    height: 100vh;
    overflow-y: scroll;

    main {
      padding: 4rem 0 0 4rem;
    }

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
