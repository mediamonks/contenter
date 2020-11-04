<template>
  <div class="locale-list">
    <form @submit.prevent="handleFormSubmit">
      <Modal :visible="modalVisible">
        <template #header>
          <h1>Create a locale</h1>
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
            flat
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
        v-if="projectsState.currentProject.metadata.locales.length > 0"
        class="button"
        flat
        @click="openCreateLocaleModal"
      >
        Create a Locale
      </Button>
    </ProjectBar>
    <MainContainer
      v-if="projectsState.currentProject.metadata.locales.length > 0"
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
        </tr>
        <tr
          v-for="locale in projectsState.currentProject.metadata.locales"
          :key="`locale-list-${locale.code}`"
          class="locale-row"
          @click="navigateToLocalePage(locale.code)"
        >
          <td>
            {{ locale.code }}
          </td>
          <td>
            {{ locale.name }}
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
import { defineComponent, ref, reactive } from 'vue';
import ProjectBar from '@/components/ProjectBar.vue';
import MainContainer from '@/components/MainContainer.vue';
import Button from '@/components/Button.vue';
import Modal from '@/components/Modal.vue';
import TextField from '@/components/TextField.vue';
import { createNewLocale, projectsState } from '@/store/projects';
import { displayError } from '@/store/error';
import router from '@/router';

export default defineComponent({
  name: 'LocaleList',
  components: {
    ProjectBar,
    MainContainer,
    Button,
    Modal,
    TextField,
  },
  setup() {
    const modalVisible = ref(false);
    const localeCreationFormData = reactive({
      code: '',
      name: '',
    });

    function openCreateLocaleModal() {
      modalVisible.value = true;
    }

    function closeCreateLocaleModal() {
      modalVisible.value = false;
    }

    async function handleFormSubmit() {
      localeCreationFormData.code = localeCreationFormData.code.toUpperCase();

      await createNewLocale(localeCreationFormData.code, localeCreationFormData.name)
        .catch((error) => displayError(error));

      localeCreationFormData.code = '';
      localeCreationFormData.name = '';

      closeCreateLocaleModal();
    }

    function navigateToLocalePage(locale: string) {
      const { projectId } = router.currentRoute.value.params;
      router.push({ name: 'ProjectContent', params: { projectId, locale } });
    }

    return {
      openCreateLocaleModal,
      closeCreateLocaleModal,
      modalVisible,
      localeCreationFormData,
      handleFormSubmit,
      projectsState,
      navigateToLocalePage,
    };
  },
});
</script>

<style lang="scss" scoped>
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
          th, td {
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
      }

      .locale-row {
        transition: 0.2s ease-out;
        cursor: pointer;

        &:hover {
          background: $colorGrey100;
        }
      }
    }
  }
}
</style>
