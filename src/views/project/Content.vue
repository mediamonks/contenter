<template>
  <div class="content-page">
    <ProjectBar :subtitle="`${metadata.id} - ${localeName}`">
      <template #main>
        <div class="autosave-message">
          <Sync
            ref="syncIcon"
            class="sync-icon"
          />
          <p>Your progress is being synchronized to the database</p>
        </div>
      </template>
      <Button
        v-if="projectData"
        is-flat
        @click="exportToJSON"
      >
        Export to JSON
      </Button>
    </ProjectBar>
    <main v-if="currentProject.schemaUrl">
      <AssetSelector />
      <router-link
        class="back-button"
        :to="{ name: 'ProjectLocaleList', params: { projectId: metadata.id } }"
      >
        <ArrowToLeft />Back to locales
      </router-link>
      <label>
        Reference Locale
        <select
          id="referenceLocale"
          v-model="referenceLocale"
          name="Reference Locale"
        >
          <template
            v-for="localeOption in currentProject.metadata.locales"
            :key="localeOption.code"
          >
            <option
              v-if="localeOption.code !== locale"
              :value="localeOption.code"
            >{{ localeOption.name }} ({{ localeOption.code }})</option>
          </template>
          <option :value="null">None</option>
        </select>
      </label>
      <div
        ref="jsonEditor"
        class="json-editor"
      />
    </main>
    <main
      v-else
      class="no-schema"
    >
      <h2>You first need to define a schema for {{ currentProject.metadata.name }}</h2>
      <Button
        class="button"
        :to="{
          name: 'ProjectSchema',
          params: { projectId: currentProject.metadata.id },
        }"
      >
        Go to schema
      </Button>
    </main>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, onMounted, watch, onBeforeUnmount, computed,
} from 'vue';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { debounce, get } from 'lodash';
import {
  downloadData,
  getCurrentProjectContent,
  onProjectUpdate,
  ProjectMetadata,
  projectsState,
  updateProject,
} from '@/store/projects';
import ProjectBar from '@/components/ProjectBar.vue';
import Button from '@/components/Button.vue';
import ArrowToLeft from '@/assets/icons/ArrowToLeft.vue';
import Sync from '@/assets/icons/Sync.vue';
import { displayError } from '@/store/message';
import { loadFirebaseAnalytics } from '@/firebase';
import { User } from '@/store/user';
import AssetSelector from '@/components/AssetSelector.vue';
import { Json } from '@/types/Json';

export default defineComponent({
  name: 'Content',
  components: {
    Button,
    ProjectBar,
    ArrowToLeft,
    Sync,
    AssetSelector,
  },
  props: {
    locale: {
      type: String,
      required: true,
    },
  },
  setup(props: { locale: string }) {
    const jsonEditor = ref<HTMLDivElement | null>(null);
    const contentData = ref<Json | null>(null);
    // Necessary any because the JSON editor doesn't support TS properly
    let editor: any = null;
    let mdEditors: EasyMDE[] = [];

    const projectData = computed<Json | undefined>(() => getCurrentProjectContent(props.locale));

    const localeName = computed<string | undefined>(
      () => projectsState.currentProject?.locales?.[props.locale].name,
    );

    const metadata = computed<ProjectMetadata<User> | undefined>(
      () => projectsState.currentProject?.metadata,
    );

    const syncIcon = ref<typeof Sync | null>(null);

    async function changeData() {
      contentData.value = editor.getValue();

      if (!projectsState.currentProject?.metadata) return;

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

      (await loadFirebaseAnalytics()).logEvent('changeContent', {
        projectId: projectsState.currentProject.metadata.id,
      });

      if (!syncIcon.value) return;
      const { gsap, Power3 } = await import(/* webpackChunkName: "gsap" */ 'gsap');

      gsap.fromTo(
        syncIcon.value.$el,
        {
          rotate: 0,
        },
        {
          rotate: 720,
          ease: Power3.easeInOut,
          duration: 1,
        },
      );
    }

    function resetMarkdownEditors() {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          mdEditors.forEach((mdEditor) => {
            mdEditor.toTextArea();
          });
          mdEditors = [];
          resolve();
        }, 10);
      });
    }

    function initMarkdownEditor() {
      return new Promise<HTMLTextAreaElement[]>((resolve) => {
        resetMarkdownEditors();

        setTimeout(() => {
          if (!jsonEditor.value) return;
          const mdFields = [
            ...jsonEditor.value.querySelectorAll<HTMLTextAreaElement>(
              'textarea[data-schemaformat="markdown"]',
            ),
          ];

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

          resolve(mdFields);
        }, 10);
      });
    }

    onMounted(async () => {
      if (!jsonEditor.value) return;
      const { JSONEditor } = await import(
        /* webpackChunkName: "JSONEditor" */ '@json-editor/json-editor'
      );

      editor = new JSONEditor(jsonEditor.value, {
        schema: projectsState.currentProjectSchema,
        object_layout: 'tabs',
      });

      if (projectData.value) {
        editor.setValue(projectData.value);
      }
      await initMarkdownEditor();

      editor.on('change', changeData);
    });

    onBeforeUnmount(() => {
      if (!editor) return;

      editor.off('change', changeData);
    });

    const handleProjectStateChange = debounce(async () => {
      if (!projectData.value) return;
      if (!editor) return;

      await resetMarkdownEditors();
      editor.setValue(projectData.value);
      await initMarkdownEditor();

      mdEditors.forEach((mdEditor) => {
        const { value } = (mdEditor as any).element;

        if (value !== mdEditor.value()) {
          mdEditor.value(value as string);
        }
      });
    }, 300);

    onProjectUpdate(handleProjectStateChange);

    async function exportToJSON() {
      if (!projectData.value) return;
      downloadData(projectData.value, props.locale);

      (await loadFirebaseAnalytics()).logEvent('exportJSON', {
        projectId: projectsState.currentProject?.metadata?.id,
      });
    }

    const referenceLocale = ref<string | null>(null);

    watch(referenceLocale, (value) => {
      if (!jsonEditor.value) return;
      const currentRefElements = [
        ...jsonEditor.value.querySelectorAll<HTMLDivElement>('.ref-element'),
      ];
      currentRefElements.forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.outerHTML = '';
      });

      if (!value) return;

      const formControlElements = [
        ...jsonEditor.value.querySelectorAll<HTMLDivElement>('.form-control'),
      ];
      const projectLocaleData = getCurrentProjectContent(value);
      if (!projectLocaleData) return;

      formControlElements.forEach((element) => {
        const inputElement = element.querySelector<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >('[name]');
        let path = inputElement?.getAttribute('name');

        if (!path) return;

        // removes unnecessary 'root' key from path that gets generated by JSONEditor
        const filterWords = ['root'];
        const rgx = new RegExp(filterWords.join(''), 'gi');
        path = path.replace(rgx, '');

        const refData = get(projectLocaleData, path);

        if (refData === '') return;

        const refElement = document.createElement('p');
        refElement.textContent = `${value} value: ${refData}`;
        refElement.classList.add('ref-element');

        element.appendChild(refElement);
      });
    });

    return {
      jsonEditor,
      exportToJSON,
      localeName,
      metadata,
      projectData,
      referenceLocale,
      syncIcon,
      currentProject: projectsState.currentProject,
    };
  },
});
</script>

<style lang="scss">
@import '~@/assets/scss/variables';

.content-page {
  height: 100vh;
  overflow-y: scroll;

  .autosave-message {
    display: flex;
    align-items: center;

    .icon {
      height: 1.25em;
      margin-right: 2rem;
      color: $colorBlue400;
    }
  }

  > main {
    padding: 4rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
  }

  .back-button {
    display: flex;
    height: 1.5em;
    align-items: center;
    gap: 1rem;
    color: $colorGrey900;
    font-weight: 600;
    text-decoration: none;
    transition: 0.2s ease-out;
    width: fit-content;

    .icon {
      width: 3rem;
      height: 100%;
      color: $colorBlue400;
    }

    &:hover {
      color: $colorBlue400;
      gap: 1.5rem;
    }
  }

  .json-editor {
    margin-top: 2rem;
    width: 100%;

    div[data-schematype='array'] {
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

    div[data-schematype='object'] {
      > .je-indented-panel {
        margin-right: -1px;
        margin-bottom: 3rem;
        border-radius: 1rem;
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

    input,
    select,
    textarea {
      font-size: 2rem;
      padding: 1rem;
      border: solid 1px $colorGrey100;
      border-radius: 0.5rem;
      transition: border-color 0.1s ease-out;
      width: calc(100% - 2rem);
      background: $colorGrey050;
      font-style: normal;

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
      transition-property: border-color, color;

      &:hover {
        border-color: $colorBlue400;
        color: $colorBlue400;
      }

      &.json-editor-btn-edit_properties,
      &.json-editor-btn-collapse {
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
