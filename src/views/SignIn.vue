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
        :is-loading="isLoading"
        @click="handleSignIn"
      >
        Sign in with Google
      </Button>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import router, { RouteNames } from '@/router';
import { signIn } from '@/store/user';
import Button from '@/components/Button.vue';
import { displayError } from '@/store/message';

export default defineComponent({
  name: 'SignIn',
  components: {
    Button,
  },
  setup() {
    const isLoading = ref(false);

    function handleSignIn() {
      isLoading.value = true;
      return signIn()
        .then(() => {
          router.push({ name: RouteNames.HOME });
        })
        .catch((error: Error) => displayError(error))
        .finally(() => {
          isLoading.value = false;
        });
    }

    return {
      handleSignIn,
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables';

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
