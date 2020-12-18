<template>
  <div class="assets">
    <ProjectBar>
      <Button
        flat
        :loading="uploading"
        label-for="asset-uploader"
      >
        Upload an asset
      </Button>
    </ProjectBar>
    <main
      v-if="loading"
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
          :loading="loading"
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
  // TODO: the plural name `Assets` is a bit unclear
  name: 'Assets',
  components: {
    ProjectBar,
    MainContainer,
    AssetCard,
    AssetInfoPanel,
    Button,
  },
  setup() {
    // TODO: booleans should start with is, has, will, etc.
    const loading = ref(true);
    if (projectsState.currentProject?.assets
      && projectsState.currentProject?.assets?.length > 0) {
      loading.value = false;
    }
    getProjectAssets()
      .catch((error) => displayError(error))
      .then(() => { loading.value = false; });

    const assetInfoPanel = ref<(typeof AssetInfoPanel) | null>(null);
    function openInfoPanel(index: number) {
      if (!assetInfoPanel.value) return;
      assetInfoPanel.value.openView(projectsState.currentProject?.assets?.[index]);
    }

    // TODO: booleans should start with is, has, will, etc.
    const uploading = ref(false);
    function handleAssetUpload(event: InputEvent) {
      // TODO: refactor this so you don't have to use ts-ignore
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const [file]: File = event.target.files;

      if (!file || !projectsState.currentProject?.metadata?.id) return;
      uploading.value = true;
      uploadAsset(file, projectsState.currentProject.metadata.id)
        .catch((error) => displayError(error))
        .then(() => { uploading.value = false; });
    }

    return {
      currentProject: projectsState.currentProject,
      openInfoPanel,
      assetInfoPanel,
      handleAssetUpload,
      uploading,
      loading,
    };
  },
});
</script>

<style lang="scss" scoped>
.assets {
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
