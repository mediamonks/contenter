<template>
  <router-link
    v-if="to"
    :to="to"
    class="button"
    :class="{ flat: flat }"
  >
    <template v-if="loading">
      Please wait...
    </template>
    <slot v-else />
  </router-link>
  <label
    v-else-if="labelFor"
    :for="labelFor"
    class="button"
    :class="{ flat: flat }"
  >
    <template v-if="loading">
      Please wait...
    </template>
    <slot v-else />
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
    // TODO: booleans should start with is, has, will, etc.
    loading: {
      type: Boolean,
      default: false,
    },
    // TODO: booleans should start with is, has, will, etc.
    flat: {
      type: Boolean,
      default: false,
    },
    to: {
      // TODO: is it possible to create a type for Object?
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
    border-radius: 0.5rem;
    height: fit-content;
    cursor: pointer;
    transition: 0.2s ease-out;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    width: fit-content;
    border: 1px solid $colorBlue400;

    &:hover {
      background: $colorBlue300;
      border-color: $colorBlue300;
    }

    &:disabled {
      background: $colorGrey100;
      color: $colorGrey300;
      border-color: $colorGrey100;
      cursor: not-allowed;

      &:hover {
        background: $colorGrey100;
        color: $colorGrey300;
      }
    }

    &.flat {
      background: transparent;
      color: $colorBlue400;
      border-color: $colorGrey100;

      &:hover {
        border-color: $colorBlue400;
      }
    }
  }
</style>
