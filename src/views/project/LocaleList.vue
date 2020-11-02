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
    <ProjectBar />
    <MainContainer class="no-locales">
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

    function handleFormSubmit() {
      localeCreationFormData.code = localeCreationFormData.code.toUpperCase();
      console.log(localeCreationFormData);

      localeCreationFormData.code = '';
      localeCreationFormData.name = '';

      closeCreateLocaleModal();
    }

    return {
      openCreateLocaleModal,
      closeCreateLocaleModal,
      modalVisible,
      localeCreationFormData,
      handleFormSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
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
}
</style>
