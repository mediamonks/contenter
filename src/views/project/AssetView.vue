<template>
  <div class="asset-view">
    <ProjectBar>
      <Button
        is-flat
        :loading="isUploading"
        label-for="asset-uploader"
      >
        Upload an asset
      </Button>
    </ProjectBar>
    <main
      v-if="isLoading"
      class="loading"
    >
      <h1>Loading...</h1>
    </main>
    <template v-else>
      <template v-if="currentProject.assets.length > 0">
        <MainContainer>
          <h1>Assets</h1>
          <div class="asset-grid">
            <AssetCard
              v-for="(asset, index) in currentProject.assets"
              :key="`asset-${index}`"
              :name="asset.name"
              :thumbnail="asset.thumbnail"
              @click="openInfoPanel(index)"
            />
          </div>
        </MainContainer>
        <AssetInfoPanel ref="assetInfoPanel" />
      </template>
      <main
        v-else
        class="no-assets"
      >
        <h1>This project has no assets</h1><Button
          :loading="isLoading"
          label-for="asset-uploader"
        >
          Upload the first asset
        </Button>
      </main>
      <input
        id="asset-uploader"
        ref="fileSelector"
        type="file"
        class="upload-input"
        @change="handleAssetUpload"
      >
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ProjectBar from '@/components/ProjectBar.vue';
import MainContainer from '@/components/MainContainer.vue';
import AssetCard from '@/components/AssetCard.vue';
import AssetInfoPanel from '@/components/AssetInfoPanel.vue';
import Button from '@/components/Button.vue';
import { projectsState, getProjectAssets, uploadAsset } from '@/store/projects';
import { displayError } from '@/store/message';

export default defineComponent({
  name: 'AssetView',
  components: {
    ProjectBar,
    MainContainer,
    AssetCard,
    AssetInfoPanel,
    Button,
  },
  setup() {
    const isLoading = ref(true);
    if (projectsState.currentProject?.assets
      && projectsState.currentProject?.assets?.length > 0) {
      isLoading.value = false;
    }
    getProjectAssets()
      .catch((error) => displayError(error))
      .then(() => { isLoading.value = false; });

    const assetInfoPanel = ref<(typeof AssetInfoPanel) | null>(null);
    function openInfoPanel(index: number) {
      if (!assetInfoPanel.value) return;
      assetInfoPanel.value.openView(projectsState.currentProject?.assets?.[index]);
    }

    const isUploading = ref(false);
    function handleAssetUpload(event: Event) {
      const fileList = (event.target as HTMLInputElement).files;

      if (!fileList) throw displayError(new Error('There is no file selected'));
      if (!projectsState.currentProject?.metadata?.id) throw displayError(new Error('There is no project defined'));

      isUploading.value = true;
      return uploadAsset(fileList[0], projectsState.currentProject.metadata.id)
        .catch((error) => displayError(error))
        .then(() => { isUploading.value = false; });
    }

    return {
      currentProject: projectsState.currentProject,
      openInfoPanel,
      assetInfoPanel,
      handleAssetUpload,
      isUploading,
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
.asset-view {
  height: 100vh;
  overflow-y: scroll;
  padding-bottom: 4rem;

  .no-assets, .loading {
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 2rem;
  }

  .asset-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }

  .upload-input {
    display: none;
  }

  @media screen and (min-width: 1600px) {
    .asset-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }
}
</style>
