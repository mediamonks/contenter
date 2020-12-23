<template>
  <transition name="fade">
    <div v-if="isVisible"
class="modal">
      <section class="content">
        <header>
          <slot name="header" />
        </header>
        <main>
          <slot name="main" />
        </main>
        <footer>
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Modal',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';
@import '~seng-scss';

.modal {
  position: fixed;
  background: rgba(black, 0.5);
  width: calc(100% - 38rem);
  height: 100vh;
  z-index: zindex($zLayout, modal);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;

  .content {
    background: $colorGrey050;
    width: 80rem;
    border-radius: 1rem;
    box-shadow: 0 2rem 3rem rgba(black, 0.15), 0 0 4rem rgba(black, 0.15);

    header,
    main,
    footer {
      padding: 2rem;
    }

    header {
      padding-top: 4rem;
    }

    main {
      display: flex;
      flex-direction: column;
      gap: 3rem;
      padding-bottom: 4rem;
    }

    footer {
      border-top: solid 1px $colorGrey100;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  pointer-events: none;
}
</style>
