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
    <aside>
      <template v-if="data">
        <header v-if="data.thumbnail">
          <img
            :src="data.thumbnail"
            :alt="data.name"
          >
        </header>
        <main>
          <h2>{{ data.name }}</h2>
          <ul>
            <li>
              <label>Remote URL</label>
              <p>{{ data.remoteURL }}</p>
            </li>
            <li>
              <label>Relative path</label>
              <p>{{ data.relativePath }}</p>
            </li>
            <li>
              <label>Type</label>
              <p>{{ data.type }}</p>
            </li>
            <li v-if="data.dimensions">
              <label>Dimensions</label>
              <p>{{ data.dimensions.width }}x{{ data.dimensions.height }}px</p>
            </li>
            <li>
              <label>Size</label>
              <p v-if="data.size >= 1000000">
                {{ data.size / 1000000 }}MB
              </p>
              <p v-else-if="data.size >= 1000">
                {{ data.size / 1000 }}kB
              </p>
              <p v-else>
                {{ data.size / 1000 }}B
              </p>
              <p
                v-if="data.size >= 2000000"
                class="warn body-small"
              >
                The size of this file is over 2MB, please consider optimizing this file.
              </p>
            </li>
          </ul>
        </main>
      </template>
    </aside>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, onMounted,
} from 'vue';
import gsap from 'gsap';
import { Asset } from '@/store/assets';

export default defineComponent({
  name: 'AssetInfoPanel',
  setup() {
    const active = ref(false);
    const root = ref<HTMLDivElement | null>(null);
    const data = ref<Asset | null>(null);

    let toggleTimeline: gsap.core.Timeline | null = null;

    function getToggleTimeline(): gsap.core.Timeline | null {
      const overlayBox = root.value?.querySelector<HTMLDivElement>('.overlay-box');
      const aside = root.value?.querySelector<HTMLElement>('aside');

      if (!overlayBox || !aside) return null;

      const timeline = gsap.timeline({
        paused: true,
      });

      timeline
        .fromTo(overlayBox, {
          autoAlpha: 0,
          pointerEvents: 'none',
          duration: 0.2,
        }, {
          autoAlpha: 1,
          pointerEvents: 'all',
        }, 0)
        .fromTo(aside, {
          x: '100%',
          autoAlpha: 0,
          ease: 'power3',
          pointerEvents: 'none',
          duration: 0.2,
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

    return {
      active,
      root,
      closeView,
      openView,
      data,
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

  aside {
    position: absolute;
    right: 0;
    top: 0;
    width: 64rem;
    height: 100%;
    background: $colorGrey050;
    box-shadow: 0 0 3rem 1rem rgba(black, 0.3);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: all;

    header {
      height: 32rem;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    main {
      flex-basis: 100%;
      padding: 2rem;

      ul {
        list-style: none;
        margin-top: 2rem;
      }

      .warn {
        color: $colorError;
      }
    }
  }
}
</style>
