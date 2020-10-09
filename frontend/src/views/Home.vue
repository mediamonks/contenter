<template>
  <div class="home">
    <header>
      <h3>MM Content Editor</h3>
      <aside>
        <Button
          flat
          @click="handleSignOut"
        >
          Sign Out
        </Button>
        <Avatar
          v-if="userState.currentUser"
          inverted
          :image="userState.currentUser.photoURL"
          :name="userState.currentUser.displayName"
          :role="userState.currentUser.role"
        />
      </aside>
    </header>
    <main>
      <h1 class="title">
        Your Projects
      </h1>
      <ul>
        <li
          v-for="project in projectsState"
          :key="project.id"
        >
          <router-link to="/">
            <ProjectCard
              :id="project.id"
              :name="project.name"
              :users="project.users"
            />
          </router-link>
        </li>
        <li>
          <button class="add-project">
            <h2>Add Project</h2>
          </button>
        </li>
      </ul>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { signOut, userState } from '@/store/user';
import Avatar from '@/components/Avatar.vue';
import ProjectCard from '@/components/ProjectCard.vue';
import { projectsState, syncProjects } from '@/store/projects';
import Button from '@/components/Button.vue';
import router from '@/router';

export default defineComponent({
  name: 'Home',
  components: {
    Avatar,
    ProjectCard,
    Button,
  },
  setup() {
    syncProjects().catch((err) => {
      console.error(err);
    });

    async function handleSignOut() {
      await signOut();
      await router.push('/sign-in');
    }

    return {
      userState,
      projectsState,
      handleSignOut,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/variables';

  .home {
    header {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      padding: 4rem;

      aside {
        display: flex;
        align-items: center;

        > * {
          margin-left: 1rem;
        }
      }
    }

    main {
      max-width: 166rem;
      margin: 10rem auto 0;
      padding: 0 3rem;

      ul {
        margin-top: 5rem;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 2rem;
        list-style: none;

        a {
          color: initial;
          text-decoration: none;
        }

        .add-project {
          display: block;
          height: 30rem;
          width: 100%;
          border: dashed 2px $colorGrey100;
          border-radius: 1rem;
          background: none;
          cursor: pointer;
          transition: 0.2s ease-out;

          h2 {
            color: $colorBlue400;
          }

          &:hover {
            border-color: $colorBlue400;
          }
        }
      }
    }
  }
</style>
