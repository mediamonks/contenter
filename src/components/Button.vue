<template>
  <router-link
    v-if="to"
    :to="to"
    class="button"
    :class="{ flat: flat }"
  >
    <slot />
  </router-link>
  <label
    v-else-if="labelFor"
    :for="labelFor"
    class="button"
    :class="{ flat: flat }"
  >
    <slot />
  </label>
  <button
    v-else
    class="button"
    :class="{ flat: flat }"
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
    flat: {
      type: Boolean,
      default: false,
    },
    to: {
      type: [Object, String],
      default: () => null,
    },
    labelFor: {
      type: String,
      default: null,
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
    font-size: 2rem;
    line-height: 3rem;
    padding: 1rem 2.5rem;
    border: none;
    border-radius: 0.5rem;
    height: fit-content;
    cursor: pointer;
    transition: 0.2s ease-out;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    width: fit-content;

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

    &.flat {
      background: transparent;
      color: $colorBlue400;
      border: 1px solid $colorGrey100;

      &:hover {
        border-color: $colorBlue400;
      }
    }
  }
</style>
