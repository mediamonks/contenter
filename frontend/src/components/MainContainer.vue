<template>
  <main class="main-container">
    <slot />
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainContainer',
});
</script>

<style lang="scss" scoped>
.main-container {
  margin: 0 auto;
  padding: 4rem 4rem 0;
}
</style>
