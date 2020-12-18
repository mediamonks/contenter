<template>
  <div
    ref="root"
    class="asset-info-panel"
  >
    <div
      class="overlay-box"
      @click="closeView"
    >
      <img
        v-if="data && data.thumbnail"
        :src="data.thumbnail"
        :alt="data.name"
      >
    </div>
    <div class="aside">
      <AssetInfo
        :data="data"
      />
      <button
        class="close-button"
        @click="closeView"
      >
        <CloseIcon class="icon" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, onMounted,
} from 'vue';
import gsap from 'gsap';
import { Asset } from '@/store/projects';
import AssetInfo from '@/components/AssetInfo.vue';
import { downloadFile } from '@/util';
import CloseIcon from '@/assets/icons/CloseIcon.vue';

export default defineComponent({
  name: 'AssetInfoPanel',
  components: {
    AssetInfo,
    CloseIcon,
  },
  setup() {
    const active = ref(false);
    const root = ref<HTMLDivElement | null>(null);
    const data = ref<Asset | null>(null);

    let toggleTimeline: gsap.core.Timeline | null = null;

    function getToggleTimeline(): gsap.core.Timeline | null {
      const overlayBox = root.value?.querySelector<HTMLDivElement>('.overlay-box');
      const aside = root.value?.querySelector<HTMLElement>('.aside');

      if (!overlayBox || !aside) return null;

      const timeline = gsap.timeline({
        paused: true,
      });

      timeline
        .fromTo(overlayBox, {
          autoAlpha: 0,
          pointerEvents: 'none',
          duration: 0.1,
        }, {
          autoAlpha: 1,
          pointerEvents: 'all',
        }, 0)
        .fromTo(aside, {
          x: '100%',
          autoAlpha: 0,
          ease: 'power3',
          pointerEvents: 'none',
          duration: 0.1,
        }, {
          x: '0%',
          autoAlpha: 1,
          pointerEvents: 'all',
        }, 0);
      return timeline;
    }

    function openView(asset: Asset) {
      if (!toggleTimeline) return;
      data.value = asset;

      toggleTimeline.play();
    }

    function closeView() {
      if (!toggleTimeline) return;
      toggleTimeline.reverse().then(() => { data.value = null; });
    }

    onMounted(() => {
      toggleTimeline = getToggleTimeline();
    });

    function handleAssetDownload() {
      if (!data.value) return;
      downloadFile(data.value.remoteURL, data.value.name);
    }

    return {
      active,
      root,
      closeView,
      openView,
      data,
      handleAssetDownload,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';

.asset-info-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;

  .overlay-box {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(black, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 64rem;

    img {
      padding: 8rem;
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 1rem 2rem rgba(black, 0.15)) drop-shadow(0 0 3rem rgba(black, 0.15));
    }
  }

  .aside {
    width: 64rem;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
  }

  .close-button {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: block;
    background: $colorBlue400;
    border: none;
    padding: 1.5rem;
    border-radius: 100%;
    box-shadow: 0 1rem 2rem rgba(black, 0.15), 0 0 3rem rgba(black, 0.15);
    cursor: pointer;
    transition: 0.2s ease-out;

    .icon {
      height: 2rem;
      color: $colorGrey050
    }

    &:hover {
      background: $colorBlue300;
    }
  }
}
</style>
