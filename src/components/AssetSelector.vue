<template>
  <div
    v-if="assets.length > 0"
    class="asset-selector"
  >
    <button
      class="view-toggle"
      @click="toggleView"
    >
      <PhotoVideo
        v-if="!active"
        class="icon"
      />
      <Close
        v-else
        class="icon close"
      />
    </button>
    <section
      v-if="active"
      class="selector-view"
    >
      <header>
        <h2>Select an asset</h2>
      </header>
      <main>
        <AssetCard
          v-for="(asset, index) in assets"
          :key="`asset-${index}`"
          :name="asset.name"
          :thumbnail="asset.thumbnail"
          @click="showDetails(index)"
        />
      </main>
      <template v-if="activeIndex !== null">
        <AssetInfo

          class="info"
          :data="assets[activeIndex]"
        />
        <button
          class="back-button"
          @click="hideDetails"
        >
          <ArrowToLeft class="icon" /> Back
        </button>
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { assets, getProjectAssets } from '@/store/assets';
import PhotoVideo from '@/assets/icons/PhotoVideo.vue';
import AssetCard from '@/components/AssetCard.vue';
import AssetInfo from '@/components/AssetInfo.vue';
import { projectsState } from '@/store/projects';
import { displayError } from '@/store/message';
import Close from '@/assets/icons/Close.vue';
import ArrowToLeft from '@/assets/icons/ArrowToLeft.vue';

export default defineComponent({
  name: 'AssetSelector',
  components: {
    AssetCard,
    AssetInfo,
    PhotoVideo,
    Close,
    ArrowToLeft,
  },
  setup() {
    const projectId = projectsState.currentProject?.metadata?.id;
    if (projectId) {
      getProjectAssets(projectId).catch((error) => displayError(error));
    }

    const activeIndex = ref<number | null>(null);
    function showDetails(index: number) {
      activeIndex.value = index;
    }

    function hideDetails() {
      activeIndex.value = null;
    }

    const active = ref(false);
    function toggleView() {
      active.value = !active.value;
      activeIndex.value = null;
    }

    return {
      assets,
      activeIndex,
      showDetails,
      hideDetails,
      active,
      toggleView,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';

.asset-selector {
  position: fixed;
  z-index: 10;
  right: 4rem;
  bottom: 4rem;

  .view-toggle {
    border: none;
    background: $colorBlue400;
    color: $colorGrey050;
    width: 7rem;
    height: 7rem;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    box-shadow: 0 1rem 2rem rgba(black, 0.15), 0 0 3rem rgba(black, 0.15);
    cursor: pointer;
    transition: 0.2s ease-out;

    .icon {
      height: 2.5rem;
    }

    &:hover {
      background: $colorBlue300;
    }
  }

  .selector-view {
    width: 90rem;
    position: absolute;
    bottom: 8rem;
    right: 0;
    background: $colorGrey050;
    box-shadow: 0 1rem 2rem rgba(black, 0.15), 0 0 3rem rgba(black, 0.15);
    border-radius: 1rem;
    height: 100rem;
    overflow: auto;

    header {
      padding: 2rem 2rem 8rem;
      border-bottom: solid 1px $colorGrey100;
    }

    main {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      padding: 2rem;
    }

    .info {
      z-index: 10;
      position: absolute;
    }

    .back-button {
      position: absolute;
      z-index: 11;
      top: 2rem;
      left: 2rem;
      background: transparent;
      padding: 0;
      border: none;
      color: $colorGrey050;
      filter: drop-shadow(0 0 0.25rem rgba(black, 1));
      font-size: 2rem;
      cursor: pointer;

      .icon {
        color: inherit;
      }
    }
  }
}
</style>
