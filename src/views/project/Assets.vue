<template>
  <div class="assets">
    <ProjectBar>
      <Button
        flat
        :loading="loading"
        label-for="asset-uploader"
      >
        Upload an asset
      </Button>
    </ProjectBar>
    <MainContainer>
      <h1>Assets</h1>
      <div class="asset-grid">
        <AssetCard
          v-for="(asset, index) in assets"
          :key="`asset-${index}`"
          :name="asset.name"
          :thumbnail="asset.thumbnail"
          @click="openInfoPanel(index)"
        />
      </div>
    </MainContainer>
    <AssetInfoPanel ref="assetInfoPanel" />
    <input
      id="asset-uploader"
      ref="fileSelector"
      type="file"
      class="upload-input"
      @change="handleAssetUpload"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ProjectBar from '@/components/ProjectBar.vue';
import MainContainer from '@/components/MainContainer.vue';
import AssetCard from '@/components/AssetCard.vue';
import AssetInfoPanel from '@/components/AssetInfoPanel.vue';
import Button from '@/components/Button.vue';
import { assets, getProjectAssets, uploadAsset } from '@/store/assets';
import { projectsState } from '@/store/projects';
import { displayError } from '@/store/error';

export default defineComponent({
  name: 'Assets',
  components: {
    ProjectBar,
    MainContainer,
    AssetCard,
    AssetInfoPanel,
    Button,
  },
  setup() {
    const projectId = projectsState.currentProject?.metadata?.id;
    if (projectId) {
      getProjectAssets(projectId).catch((error) => displayError(error));
    }

    const assetInfoPanel = ref<(typeof AssetInfoPanel) | null>(null);
    function openInfoPanel(index: number) {
      if (!assetInfoPanel.value) return;
      assetInfoPanel.value.openView(assets.value[index]);
    }

    const loading = ref(false);
    function handleAssetUpload(event: InputEvent) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const [file]: File = event.target.files;

      if (!file || !projectsState.currentProject?.metadata?.id) return;
      loading.value = true;
      uploadAsset(file, projectsState.currentProject.metadata.id)
        .catch((error) => displayError(error))
        .then(() => { loading.value = false; });
    }

    return {
      assets,
      openInfoPanel,
      assetInfoPanel,
      handleAssetUpload,
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
