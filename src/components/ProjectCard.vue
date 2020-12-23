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
        :image="user.photoUrl"
        :title="user.name"
      />
      <p v-if="filteredUsers.length === MAX_VISIBLE_USER"
class="body-normal">
        +{{ users.length - MAX_VISIBLE_USER }}
      </p>
    </footer>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRef } from 'vue';
import Avatar from '@/components/Avatar.vue';
import { User } from '@/store/user';

interface ProjectCardProps {
  name: string;
  id: string;
  users: Array<User>;
}

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
      type: Array as PropType<Array<User>>,
      required: true,
    },
  },
  setup(props: ProjectCardProps) {
    const MAX_VISIBLE_USER = 6;
    const users = toRef<ProjectCardProps, 'users'>(props, 'users');

    const filteredUsers = computed<Array<User>>(() => users.value.slice(0, MAX_VISIBLE_USER));

    return {
      filteredUsers,
      MAX_VISIBLE_USER,
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
