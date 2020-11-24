<template>
  <div class="assets">
    <ProjectBar />
    <MainContainer>
      <h1>Assets</h1>
      <div class="asset-grid">
        <AssetCard
          v-for="(asset, index) in assets"
          :key="`asset-${index}`"
          :name="asset.name"
          :thumbnail="asset.thumbnail"
          file-type="jpg"
          @click="openInfoPanel(index)"
        />
      </div>
    </MainContainer>
    <AssetInfoPanel ref="assetInfoPanel" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ProjectBar from '@/components/ProjectBar.vue';
import MainContainer from '@/components/MainContainer.vue';
import AssetCard from '@/components/AssetCard.vue';
import AssetInfoPanel from '@/components/AssetInfoPanel.vue';
import { assets, getProjectAssets } from '@/store/assets';
import { projectsState } from '@/store/projects';
import { displayError } from '@/store/error';

export default defineComponent({
  name: 'Assets',
  components: {
    ProjectBar,
    MainContainer,
    AssetCard,
    AssetInfoPanel,
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

    return {
      assets,
      openInfoPanel,
      assetInfoPanel,
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

  @media screen and (min-width: 1600px) {
    .asset-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }
}
</style>
