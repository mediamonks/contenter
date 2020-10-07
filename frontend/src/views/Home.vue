<template>
  <div class="home">
    <template v-if="user.currentUser">
      <h1>{{ user.currentUser.displayName }}</h1>
      <pre>
        {{ user }}
      </pre>
      <label>
        Name
        <input
          v-model="name"
          type="text"
        >
      </label>
      <button @click="changeName">
        change name
      </button>
      <button @click="signOut">
        sign out
      </button>
    </template>
    <button
      v-else
      @click="signIn"
    >
      sing in with google
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { user, signOut, signIn } from '@/store/user';

export default defineComponent({
  name: 'Home',
  setup() {
    const name = ref('');

    function changeName() {
      if (!user.currentUser) return;
      user.currentUser.displayName = name.value;
    }

    return {
      user,
      signIn,
      name,
      changeName,
      signOut,
    };
  },
});
</script>
