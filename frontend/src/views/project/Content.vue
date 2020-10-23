<template>
  <div class="content-page">
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
  defineComponent,
  ref,
  onMounted,
  watch,
  onBeforeUnmount,
} from 'vue';
import { projectsState, updateProject } from '@/store/projects';
import ProjectBar from '@/components/ProjectBar.vue';
import Button from '@/components/Button.vue';
import { displayError } from '@/store/error';

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

    function changeData() {
      contentData.value = editor.getValue();

      if (!projectsState.currentProject) return;
      if (!projectsState.currentProject.metadata) return;

      const currentData = { ...projectsState.currentProject };
      delete currentData.metadata;

      const newData = {
        ...currentData,
        content: editor.getValue(),
      };

      updateProject(projectsState.currentProject.metadata.id, newData)
        .catch((error) => displayError(error));
    }

    onMounted(async () => {
      if (!jsonEditor.value) return;
      const { JSONEditor } = await import(/* webpackChunkName: "JSONEditor" */'@json-editor/json-editor');

      editor = new JSONEditor(jsonEditor.value, {
        schema: projectsState.currentProjectSchema,
      });

      if (projectsState.currentProject?.content) {
        editor.setValue(projectsState.currentProject?.content);
      }

      editor.on('change', changeData);
    });

    onBeforeUnmount(() => {
      if (!editor) return;

      editor.off('change', changeData);
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

<style lang="scss">
  @import '~@/assets/scss/variables';

  .content-page {
    height: 100vh;
    overflow-y: scroll;

    > main {
      padding: 4rem;
    }

    .json-editor {
      div[data-schematype="array"] {
        > div {
          display: flex;

          .content {
            margin-right: -1px;
          }
        }
      }

      .je-child-editor-holder {
        margin-bottom: -1px;
      }

      .je-indented-panel {
        padding: 2rem 0 0 2rem;
        margin: 0;
        border-radius: 0 1rem 1rem 1rem;
        border: solid 1px $colorGrey100;
        display: flex;
        flex-direction: column;

        &:first-child {
          margin-top: 0;
        }

        > select {
          order: 2;
        }

        > div {
          order: 3;
        }

        > span {
          display: block;
          order: 1;
        }
      }

      .je-header {
        display: inline-flex;
        align-items: center;
      }

      div[data-schematype="object"] {
        > .je-indented-panel {
          padding: 0;
          border: none;
          background: none;
        }
      }

      .tabs {
        float: none;
        width: 15rem;
        height: fit-content;

        .je-tab {
          border: solid 1px $colorGrey100;
          margin-bottom: -1px;
          border-radius: 0;
          text-transform: capitalize;
          padding: 1rem;
          width: 100%;
          transition: 0.2s ease-out;
          white-space: nowrap;
          font-size: 1.75rem;
          font-weight: 500;
          line-height: 1em;

          &:last-child {
            border-radius: 0 0 0 1rem;
          }

          &:first-child {
            border-radius: 1rem 0 0 0;
          }
        }
      }

      .content {
        width: 100%;
      }

      input, select {
        font-size: 2rem;
        padding: 1rem;
        border: solid 1px $colorGrey100;
        border-radius: 0.5rem;
        transition: border-color 0.1s ease-out;
        width: calc(100% - 2rem);
        background: $colorGrey050;

        &:focus {
          outline: none;
          border-color: $colorBlue400;
        }
      }

      select {
        cursor: pointer;
        margin-left: 0;
      }

      .form-control {
        margin-bottom: 2rem;

        label {
          color: $colorGrey900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
      }

      button {
        font-size: 1.5rem;
        border: solid 1px $colorGrey100;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        color: $colorGrey600;
        font-weight: 500;
        background: transparent;
        margin: 1rem 0.5rem;
        cursor: pointer;
        transition: 0.1s ease-out;
        transition-property:  border-color, color;

        &:hover {
          border-color: $colorBlue400;
          color: $colorBlue400;
        }

        &.json-editor-btn-edit_properties, &.json-editor-btn-collapse {
          display: none;
        }
      }

      .je-object__controls {
        display: none;
      }
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
