<template>
  <div
    class="error-display"
    :class="{ hidden: !errorState.currentError }"
  >
    <template v-if="latestError">
      Error: {{ latestError.error.message }}
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { errorState, DisplayError } from '@/store/error';

export default defineComponent({
  name: 'ErrorDisplay',
  setup() {
    const latestError = ref<DisplayError | null>(null);

    watch(errorState, () => {
      if (errorState.currentError) {
        latestError.value = errorState.currentError;
      }
    });

    return {
      errorState,
      latestError,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/variables';

  .error-display {
    position: fixed;
    bottom: 5rem;
    right: 5rem;
    z-index: 10;
    padding: 1rem 2rem 0.5rem;
    color: $colorError;
    font-weight: 500;
    background: $colorGrey900;
    border-bottom: 0.5rem solid $colorError;
    border-radius: 0.5rem;
    box-shadow: 0 2rem 3rem rgba(black, 0.15), 0 0 3rem rgba(black, 0.15);
    transition: 0.2s ease-out;

    &.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(5rem);
    }
  }
</style>
