<template>
  <section class="project-card">
    <header>
      <h2>{{ name }}</h2>
      <p class="body-small">
        {{ id }}
      </p>
    </header>
    <footer>
      <Avatar
        v-for="(user, index) in filteredUsers"
        :key="`project-${id}-avatar-${index}`"
        class="avatar"
        :image="user.photoURL"
        :title="user.name"
      />
      <!-- TODO: Why 6? Don't use magic numbers     -->
      <p
        v-if="filteredUsers.length === 6"
        class="body-normal"
      >
        +{{ users.length - 6 }}
      </p>
    </footer>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Avatar from '@/components/Avatar.vue';
import { User } from '@/store/user';

export default defineComponent({
  name: 'ProjectCard',
  components: {
    Avatar,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    users: {
      // TODO: is it possible to specify the type of the items in the Array?
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const users = ref<User[]>(props.users as User[]);

    // TODO: 6 again? (3 times on this page, -> put it in a const)
    const filteredUsers = computed<User[]>(() => users.value.slice(0, 6));

    return {
      filteredUsers,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/variables';

  .project-card {
    padding: 3rem;
    border: solid 1px $colorGrey100;
    border-radius: 1rem;
    height: 30rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: 0.2s ease-out;

    .body-small {
      color: $colorGrey600;
    }

    footer {
      display: flex;
      align-items: center;

      .avatar {
        margin-right: -3rem;
      }

      p {
        margin-left: 3rem;
        color: $colorGrey400;
      }
    }

    &:hover {
      border-color: $colorBlue400;
    }
  }
</style>
