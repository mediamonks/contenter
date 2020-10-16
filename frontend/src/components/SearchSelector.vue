<template>
  <div class="search-selector">
    <TextField
      v-model="searchInput"
      :label="label"
      :placeholder="placeholder"
      :error="error"
    />
    <ul
      v-if="selectedResults.length > 0"
      class="selected-users"
    >
      <li
        v-for="(result, index) in selectedResults"
        :key="`selected-result-${result.uid}`"
        @click="removeUser(index)"
      >
        <Avatar :image="result.photoURL" />
      </li>
    </ul>
    <ul
      v-if="results.length > 0"
      class="results"
    >
      <li
        v-for="result in results"
        :key="`result-${result.uid}`"
        @click="addUserToSelection(result)"
      >
        <Avatar
          :image="result.photoURL"
          :name="result.displayName"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, computed,
} from 'vue';
import TextField from '@/components/TextField.vue';
import { User, userState, fetchAllUsers } from '@/store/user';
import Avatar from '@/components/Avatar.vue';
import { displayError } from '@/store/error';

export default defineComponent({
  name: 'SearchSelector',
  components: {
    TextField,
    Avatar,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: null,
    },
  },
  emits: ['update-users'],
  setup(props, context) {
    fetchAllUsers().catch((error) => displayError(error));

    const searchInput = ref('');
    const selectedResults = ref<User[]>([]);
    const error = ref('');

    function addUserToSelection(user: User) {
      if (selectedResults.value.filter((result) => result.uid === user.uid).length <= 0) {
        selectedResults.value.push(user);
        context.emit('update-users', [...selectedResults.value]);
      }
    }

    function removeUser(index: number) {
      selectedResults.value.splice(index, 1);
      context.emit('update-users', [...selectedResults.value]);
    }

    const results = computed(() => {
      error.value = '';
      if (searchInput.value.split('').length === 0) return [];

      const searchResults = userState.users.filter((user) => {
        if (userState.currentUser && user.uid === userState.currentUser.uid) return null;
        if (!user.displayName.toLowerCase().search(searchInput.value.toLowerCase())) {
          return user;
        }
        return null;
      });

      if (searchResults.length === 0) {
        error.value = 'No user found';
      }

      return searchResults;
    });

    return {
      searchInput,
      results,
      selectedResults,
      error,
      addUserToSelection,
      removeUser,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/variables';

  .search-selector {
    width: 100%;

    .results {
      margin-top: 3rem;
      padding: 1rem;
      max-height: 20rem;
      overflow: auto;
      list-style: none;
      border: solid 1px $colorGrey100;
      border-radius: 0.5rem;

      li {
        padding: 0.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: 0.1s ease-out;

        &:not(:last-child) {
          margin-bottom: 1rem;
        }

        &:hover {
          background: $colorGrey100;
        }
      }
    }

    .selected-users {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      margin-top: 1rem;

      li {
        cursor: pointer;
      }
    }
  }
</style>
