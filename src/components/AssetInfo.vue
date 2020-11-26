<template>
  <aside class="asset-info">
    <template v-if="data">
      <header>
        <img
          v-if="data.thumbnail"
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
            <p>{{ basePath }}{{ data.relativePath }}</p>
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
      <footer>
        <Button
          flat
          @click="handleAssetDownload"
        >
          Download Asset
        </Button>
      </footer>
    </template>
  </aside>
</template>

<script lang="ts">
import { defineComponent, toRef, computed } from 'vue';
import Button from '@/components/Button.vue';
import { downloadFile } from '@/util';
import { projectsState } from '@/store/projects';

export default defineComponent({
  name: 'AssetInfo',
  components: {
    Button,
  },
  props: {
    data: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const data = toRef(props, 'data');

    function handleAssetDownload() {
      if (!data.value) return;
      downloadFile(data.value.remoteURL, data.value.name);
    }

    const basePath = computed<string>(() => {
      const path = projectsState.currentProject?.metadata?.relativeBasePath;
      return path || '/';
    });

    return {
      handleAssetDownload,
      basePath,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';

.asset-info {
  right: 0;
  top: 0;
  width: 100%;
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

  footer {
    padding: 2rem;

    > * {
      width: 100%;
    }
  }
}
</style>
