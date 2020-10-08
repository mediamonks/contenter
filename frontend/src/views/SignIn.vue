<template>
  <div class="sign-in">
    <main>
      <h1 class="title">
        MM Content Editor
      </h1>
      <h2 class="subtitle">
        Sign in with your MediaMonks Google account
      </h2>
      <Button
        class="button"
        :loading="loading"
        @click="handleSignIn"
      >
        Sign in with Google
      </Button>
      <p
        v-if="error"
        class="error"
      >
        Something went wrong, error: {{ error }}
      </p>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import router from '@/router';
import { signIn } from '@/store/user';
import Button from '@/components/Button.vue';

export default defineComponent({
  name: 'SignIn',
  components: {
    Button,
  },
  setup() {
    const error = ref('');
    const loading = ref(false);

    function handleSignIn() {
      loading.value = true;
      signIn()
        .then(() => {
          router.push('/');
        })
        .catch((err: Error) => {
          error.value = err.message;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    return {
      handleSignIn,
      error,
      loading,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import "~@/assets/scss/variables";

  .sign-in {
    display: flex;
    min-height: 100vh;
    justify-content: center;
    align-items: center;

    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8rem;
      border-radius: 1rem;
      border: 1px solid $colorGrey100;

      .button {
        margin-top: 5rem;
      }

      .error {
        margin-top: 3rem;
      }
    }
  }
</style>
