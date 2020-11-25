<template>
  <div
    class="asset-card"
    :class="{
      thumbnail: thumbnail || null,
      selected: selected || null,
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
      class="file-type-large"
    >
      {{ fileType }}
    </h1>
    <h4>{{ name }}</h4>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  toRef,
} from 'vue';

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
    selected: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const name = toRef(props, 'name');
    const fileType = computed(() => {
      console.log(name);

      const nameSplit = name.value.split('.');

      return nameSplit[nameSplit.length - 1];
    });

    return {
      fileType,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';

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

  > * {
    z-index: 2;
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

  .file-type-large {
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

  &.selected {
    box-shadow: 0 0 0 2px $colorGrey050, 0 0 0 4px $colorBlue400;
  }
}
</style>
