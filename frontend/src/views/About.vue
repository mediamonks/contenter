<template>
  <div class="about">
    <h1 v-if="userState.currentUser">
      {{ userState.currentUser.displayName }}
    </h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { userState } from '@/store/user';

export default defineComponent({
  setup() {
    return {
      userState,
    };
  },
});
</script>
