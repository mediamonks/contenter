<template>
  <div
    class="asset-card"
    :class="{
      thumbnail: thumbnail || null,
      'is-selected': isSelected || null,
    }"
  >
    <img
      v-if="thumbnail"
      :src="thumbnail"
      :alt="name"
      class="thumbnail"
      loading="lazy"
    >
    <h1
      v-else
      class="file-extension-large"
    >
      {{ fileExtension }}
    </h1>
    <h4>{{ name }}</h4>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, toRef } from 'vue';

export default defineComponent({
  name: 'AssetCard',
  props: {
    thumbnail: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: { thumbnail: string | null; name: string; isSelected: boolean }) {
    const name = toRef(props, 'name');
    const fileExtension = computed(() => {
      if (!name.value) return '';
      const nameSplit = name.value.split('.');

      return nameSplit[nameSplit.length - 1];
    });

    return {
      fileExtension,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';
@import '~seng-scss';

.asset-card {
  display: flex;
  padding: 1rem;
  border-radius: 0.5rem;
  height: 20rem;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  background: $colorBlue400;
  transition: 0.2s ease-out;
  cursor: pointer;
  border: solid 1px $colorGrey100;

  > * {
    z-index: zindex($zLayout, zBoost);
    color: $colorGrey050;
  }

  .thumbnail {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    object-fit: cover;
    bottom: 0;
    z-index: 0;
  }

  h4 {
    transition: 0.2s ease-out;
  }

  &.thumbnail {
    h4 {
      filter: drop-shadow(0 0 0.5rem black);
    }
  }

  .file-extension-large {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    text-transform: uppercase;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

  &:hover {
    h4 {
      transform: translateY(-1rem);
    }
  }

  &.is-selected {
    box-shadow: 0 0 0 2px $colorGrey050, 0 0 0 4px $colorBlue400;
  }
}
</style>
