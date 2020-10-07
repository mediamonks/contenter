<template>
  <div class="about">
    <h1 v-if="user.currentUser">
      {{ user.currentUser.displayName }}
    </h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { user } from '@/store/user';

export default defineComponent({
  setup() {
    return {
      user,
    };
  },
});
</script>
