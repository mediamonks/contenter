<template>
  <div class="content-page">
    <ProjectBar
      :subtitle="`${metadata.id} - ${localeName}`"
    >
      <Button
        v-if="projectData"
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
  computed,
} from 'vue';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import {
  downloadData,
  ProjectMetadata,
  projectsState,
  updateProject,
} from '@/store/projects';
import ProjectBar from '@/components/ProjectBar.vue';
import Button from '@/components/Button.vue';
import { displayError } from '@/store/error';
import { loadFirebaseAnalytics } from '@/firebase';

export default defineComponent({
  name: 'Content',
  components: {
    Button,
    ProjectBar,
  },
  props: {
    locale: {
      type: String,
      required: true,
    },
  },
  setup(props: {
    locale: string;
  }) {
    const jsonEditor = ref<HTMLDivElement | null>(null);
    const contentData = ref<object | null>(null);
    let editor: any = null;
    let mdEditors: EasyMDE[] = [];

    const projectData = computed<object | any[] | null>((): any => {
      const { locale } = props;
      if (!projectsState.currentProject) return null;
      if (!projectsState.currentProject.locales) return null;
      if (!projectsState.currentProject.locales[locale]) return null;
      if (!projectsState.currentProject.locales[locale].content) return null;

      return projectsState.currentProject.locales[locale].content;
    });

    const localeName = computed<string | null>(() => {
      if (!projectsState.currentProject) return null;
      if (!projectsState.currentProject.locales) return null;
      if (!projectsState.currentProject.locales[props.locale]) return null;

      return projectsState.currentProject.locales[props.locale].name;
    });

    const metadata = computed<ProjectMetadata | null>(() => {
      if (!projectsState.currentProject?.metadata) return null;

      return projectsState.currentProject?.metadata;
    });

    async function changeData() {
      contentData.value = editor.getValue();

      if (!projectsState.currentProject) return;
      if (!projectsState.currentProject.metadata) return;

      const currentData = { ...projectsState.currentProject };
      delete currentData.metadata;

      if (!projectsState.currentProject.locales) return;
      const { name } = projectsState.currentProject.locales[props.locale];

      const newData = {
        ...currentData,
        locales: {
          ...currentData.locales,
          [props.locale]: {
            name,
            content: editor.getValue(),
          },
        },
      };

      updateProject(projectsState.currentProject.metadata.id, newData)
        .catch((error) => displayError(error));

      const analytics = await loadFirebaseAnalytics();
      analytics.logEvent('changeContent', {
        projectId: projectsState.currentProject.metadata.id,
      });
    }

    onMounted(async () => {
      if (!jsonEditor.value) return;
      const { JSONEditor } = await import(/* webpackChunkName: "JSONEditor" */'@json-editor/json-editor');

      editor = new JSONEditor(jsonEditor.value, {
        schema: projectsState.currentProjectSchema,
        // eslint-disable-next-line @typescript-eslint/camelcase
        object_layout: 'tabs',
      });

      setTimeout(() => {
        if (!jsonEditor.value) return;
        const mdFields = [...jsonEditor.value.querySelectorAll<HTMLTextAreaElement>('textarea[data-schemaformat="markdown"]')];
        mdEditors = mdFields.map((mdField: HTMLTextAreaElement) => {
          const easyMDE = new EasyMDE({
            element: mdField,
          });

          easyMDE.codemirror.on('blur', () => {
            const path = mdField.parentElement?.parentElement?.dataset.schemapath as string;

            const textarea = editor.getEditor(path);
            textarea.setValue(easyMDE.value());
            textarea.input.value = easyMDE.value();
          });

          return easyMDE;
        });
      }, 100);

      if (projectData.value) {
        editor.setValue(projectData.value);
      }

      editor.on('change', changeData);
    });

    onBeforeUnmount(() => {
      if (!editor) return;

      editor.off('change', changeData);
    });

    watch(projectsState, () => {
      if (!projectData.value) return;
      if (!editor) return;

      editor.setValue(projectData.value);

      mdEditors.forEach((mdEditor) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const { value } = mdEditor.element;

        if (value !== mdEditor.value()) {
          mdEditor.value(value as string);
        }
      });
    });

    async function exportToJSON() {
      if (!projectData.value) return;
      downloadData(projectData.value);

      const analytics = await loadFirebaseAnalytics();

      if (!projectsState.currentProject) return;
      analytics.logEvent('exportJSON', {
        projectId: projectsState.currentProject.metadata?.id,
      });
    }

    return {
      projectsState,
      jsonEditor,
      exportToJSON,
      localeName,
      metadata,
      projectData,
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
        width: 20rem;
        top: 17rem;
        margin-right: -1px;
        height: fit-content;

        .je-tab {
          border: solid 1px $colorGrey100;
          margin-bottom: -1px;
          border-radius: 0;
          text-transform: capitalize;
          padding: 1rem;
          width: 100%;
          transition: 0.2s ease-out;
          font-size: 1.5rem;
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

      input, select, textarea {
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

      label {
        font-weight: 700;
        color: $colorGrey900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 2rem;
        line-height: 3rem;
      }

      .form-control {
        margin-bottom: 2rem;

        label {
          color: $colorGrey900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        p {
          font-size: 1.75rem;
          line-height: 2rem;
          font-weight: 400;
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
        margin: 1rem 1rem 1rem 0;
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
