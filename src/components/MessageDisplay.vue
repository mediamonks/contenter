<template>
  <div
    class="message-display"
    :class="{
      hidden: !messageState.currentMessage,
      error: messageState.currentMessage?.error
    }"
  >
    <template v-if="latestMessage?.message">
      {{ latestMessage?.message }}
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { messageState, DisplayMessage } from '@/store/message';

export default defineComponent({
  name: 'ErrorDisplay',
  setup() {
    const latestMessage = ref<DisplayMessage | null>(null);

    watch(messageState, () => {
      if (messageState.currentMessage) {
        latestMessage.value = messageState.currentMessage;
      }
    });

    return {
      messageState,
      latestMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/variables';

  .message-display {
    position: fixed;
    bottom: 5rem;
    right: 5rem;
    z-index: 100;
    padding: 1rem 2rem 0.5rem;
    color: $colorBlue050;
    font-weight: 500;
    background: $colorBlue400;
    border-bottom: 0.5rem solid $colorBlue600;
    border-radius: 0.5rem;
    box-shadow: 0 2rem 3rem rgba(black, 0.15), 0 0 3rem rgba(black, 0.15);
    transition: 0.2s ease-out;

    &.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(5rem);
    }

    &.error {
      color: lighten($colorError, 40);
      background: $colorError;
      border-color: darken($colorError, 20);
    }
  }
</style>
