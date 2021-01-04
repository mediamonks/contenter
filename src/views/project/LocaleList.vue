<template>
  <div class="locale-list">
    <form @submit.prevent="handleFormSubmit">
      <Modal :is-visible="modalVisible">
        <template #header>
          <template v-if="localeCreationFormData.duplicate">
            <h1>Duplicate locale</h1>
            <p>Duplicated from: {{ localeCreationFormData.oldLocale }}</p>
          </template>
          <h1 v-else>
            Create a locale
          </h1>
        </template>
        <template #main>
          <TextField
            v-model="localeCreationFormData.code"
            label="Code"
            placeholder="EN-GB"
            required
          />
          <TextField
            v-model="localeCreationFormData.name"
            label="Name"
            placeholder="British English"
            required
          />
        </template>
        <template #footer>
          <Button
            is-flat
            type="button"
            @click="closeCreateLocaleModal"
          >
            Cancel
          </Button>
          <Button>Save Changes</Button>
        </template>
      </Modal>
    </form>
    <ProjectBar>
      <Button
        v-if="currentProject.metadata.locales.length > 0"
        class="button"
        is-flat
        @click="openCreateLocaleModal"
      >
        Create a Locale
      </Button>
    </ProjectBar>
    <MainContainer
      v-if="currentProject.metadata.locales.length > 0"
      class="locales"
    >
      <table>
        <tr>
          <th class="code-col">
            Code
          </th>
          <th class="name-col">
            Name
          </th>
          <th class="controls-col">
            <Download @click="downloadAllContent" />
          </th>
        </tr>
        <tr
          v-for="locale in currentProject?.metadata?.locales"
          :key="`locale-list-${locale.code}`"
          class="locale-row"
        >
          <td>
            {{ locale.code }}
          </td>
          <td>
            {{ locale.name }}
          </td>
          <td class="controls">
            <Edit @click="navigateToLocalePage(locale.code)" />
            <Copy @click="duplicateLocale(locale.code)" />
            <Download @click="downloadLocale(locale.code)" />
          </td>
        </tr>
      </table>
    </MainContainer>
    <MainContainer
      v-else
      class="no-locales"
    >
      <div class="no-locales-content">
        <h1>No Locales Found</h1>
        <p>Create your first locale below</p>
        <Button
          class="button"
          @click="openCreateLocaleModal"
        >
          Create a Locale
        </Button>
      </div>
    </MainContainer>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import ProjectBar from '@/components/ProjectBar.vue';
import MainContainer from '@/components/MainContainer.vue';
import Button from '@/components/Button.vue';
import Modal from '@/components/Modal.vue';
import TextField from '@/components/TextField.vue';
import Edit from '@/assets/icons/Edit.vue';
import Copy from '@/assets/icons/Copy.vue';
import Download from '@/assets/icons/Download.vue';
import {
  createNewLocale,
  downloadData,
  getCurrentProjectContent,
  LocaleCode,
  projectsState,
} from '@/store/projects';
import { displayError } from '@/store/message';
import router from '@/router';
import { Json } from '@/types/Json';

export default defineComponent({
  name: 'LocaleList',
  components: {
    ProjectBar,
    MainContainer,
    Button,
    Modal,
    TextField,
    Edit,
    Copy,
    Download,
  },
  setup() {
    const modalVisible = ref(false);
    const localeCreationFormData = reactive<{
      code: LocaleCode;
      name: string;
      content: Json | undefined;
      duplicate: boolean;
      oldLocale: LocaleCode | null;
    }>({
      code: '' as LocaleCode,
      name: '',
      content: undefined,
      duplicate: false,
      oldLocale: null,
    });

    function resetLocaleForm() {
      localeCreationFormData.code = '' as LocaleCode;
      localeCreationFormData.name = '';
      localeCreationFormData.content = undefined;
      localeCreationFormData.duplicate = false;
      localeCreationFormData.oldLocale = null;
    }

    function openCreateLocaleModal() {
      modalVisible.value = true;
    }

    function closeCreateLocaleModal() {
      modalVisible.value = false;

      resetLocaleForm();
    }

    async function handleFormSubmit() {
      localeCreationFormData.code = localeCreationFormData.code.toUpperCase() as LocaleCode;

      await createNewLocale(
        localeCreationFormData.code,
        localeCreationFormData.name,
        localeCreationFormData.content,
      ).catch((error) => displayError(error));

      resetLocaleForm();

      closeCreateLocaleModal();
    }

    function navigateToLocalePage(locale: string) {
      const { projectId } = router.currentRoute.value.params;
      router.push({ name: 'ProjectContent', params: { projectId, locale } });
    }

    function duplicateLocale(locale: LocaleCode) {
      localeCreationFormData.content = getCurrentProjectContent(locale);
      localeCreationFormData.duplicate = true;
      localeCreationFormData.oldLocale = locale;

      openCreateLocaleModal();
    }

    function downloadLocale(locale: LocaleCode) {
      const content = getCurrentProjectContent(locale);

      if (!content) {
        displayError(new Error('Project has no content to download'));
        return;
      }

      downloadData(content, locale);
    }

    function downloadAllContent() {
      const locales = projectsState.currentProject?.metadata?.locales;

      if (!locales) {
        displayError(new Error('Project has no content'));
        return;
      }

      locales.forEach((locale) => downloadLocale(locale.code));
    }

    return {
      openCreateLocaleModal,
      closeCreateLocaleModal,
      modalVisible,
      localeCreationFormData,
      handleFormSubmit,
      currentProject: projectsState.currentProject,
      navigateToLocalePage,
      duplicateLocale,
      downloadLocale,
      downloadAllContent,
    };
  },
});
</script>

<style lang="scss">
@import '~@/assets/scss/variables';

.locale-list {
  height: 100vh;

  .no-locales {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 13rem);

    .no-locales-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .button {
        margin-top: 2rem;
      }
    }
  }

  .locales {
    table {
      width: 100%;
      border-spacing: 0;

      tr {
        height: 6rem;
        border-collapse: collapse;

        &:not(:last-child) {
          th,
          td {
            border-bottom: solid 1px $colorGrey100;
            padding: 0;
          }
        }

        th {
          text-align: left;
          color: $colorGrey900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .code-col {
          width: 15rem;
        }

        .controls-col {
          width: auto;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 6rem;

          .icon {
            height: 2.25rem;
            color: $colorGrey600;
            cursor: pointer;
            transition: 0.2s ease-out;

            &:hover {
              color: $colorBlue400;
            }
          }
        }
      }

      .locale-row {
        .controls {
          display: flex;
          justify-content: flex-end;
          height: 6rem;
          align-items: center;
          gap: 1.5rem;

          .icon {
            height: 2.25rem;
            cursor: pointer;
            transition: 0.2s ease-out;

            &:hover {
              color: $colorBlue400;
            }
          }
        }
      }
    }
  }
}
</style>
