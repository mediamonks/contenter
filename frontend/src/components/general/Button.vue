<template>
  <button
    class="button"
    :disabled="loading"
  >
    <template v-if="loading">
      Please wait...
    </template>
    <slot v-else />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
  @import "~@/assets/scss/variables";

  .button {
    display: block;
    background: $colorBlue400;
    color: $colorBlue050;
    font-weight: 600;
    font-size: 2.5rem;
    line-height: 3rem;
    padding: 1.5rem 4rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: 0.2s ease-out;

    &:hover {
      background: $colorBlue300;
    }

    &:disabled {
      background: $colorGrey100;
      color: $colorGrey300;
      cursor: not-allowed;

      &:hover {
        background: $colorGrey100;
        color: $colorGrey300;
      }
    }
  }
</style>
