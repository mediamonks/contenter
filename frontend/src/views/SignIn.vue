<template>
  <div class="sign-in">
    <main>
      <h1>MM Content Editor</h1>
      <button @click="handleSignIn">
        Sign in with Google
      </button>
      <p v-if="error">
        {{ error }}
      </p>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import router from '@/router';
import { signIn } from '@/store/user';

export default defineComponent({
  name: 'SignIn',
  setup() {
    const error = ref('');

    function handleSignIn() {
      signIn()
        .then(() => {
          router.push('/');
        })
        .catch((err: Error) => {
          error.value = err.message;
        });
    }

    return {
      handleSignIn,
      error,
    };
  },
});
</script>
