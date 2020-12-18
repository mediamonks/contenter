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
            <label>Relative path</label>
            <p @click="copyValue(basePath + data.name)">
              {{ basePath }}{{ data.name }}
            </p>
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
            <p>
              {{ parseUnitSize(data.size, 'B') }}
            </p>
            <p
              v-if="data.size >= fileSizeWarning"
              class="warn body-small"
            >
              The size of this file is over {{ parseUnitSize(fileSizeWarning, 'B', 0) }},
              please consider optimizing this file.
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
import {
  defineComponent,
  toRef,
  computed,
  PropType,
} from 'vue';
import Button from '@/components/Button.vue';
import { copyValueToClipboard, downloadFile, parseUnitSize } from '@/util';
import { projectsState, Asset } from '@/store/projects';
import { displayError, displayMessage } from '@/store/message';

interface AssetInfoProps {
  data: Asset | null;
  fileSizeWarning: number;
}

export default defineComponent({
  name: 'AssetInfo',
  components: {
    Button,
  },
  props: {
    data: {
      type: Object as PropType<Asset>,
      default: null,
    },
    fileSizeWarning: {
      type: Number,
      default: 2e6,
    },
  },
  setup(props: AssetInfoProps) {
    const data = toRef(props, 'data');

    function handleAssetDownload() {
      if (!data.value) return;
      downloadFile(data.value.remoteURL, data.value.name);
    }

    const basePath = computed<string>(() => {
      const path = projectsState.currentProject?.metadata?.relativeBasePath;
      return path || '/';
    });

    function copyValue(value: string) {
      copyValueToClipboard(value)
        .then(() => displayMessage('Copied value to clipboard', undefined, 1500))
        .catch(displayError);
    }

    return {
      handleAssetDownload,
      basePath,
      copyValue,
      parseUnitSize,
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
  box-shadow: 0 0 3rem 1rem rgba(black, 0.15), 0 0 4rem rgba(black, 0.15);
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
