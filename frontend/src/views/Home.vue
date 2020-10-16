<template>
  <div class="home">
    <main>
      <h1 class="title">
        Your Projects
      </h1>
      <ul>
        <li
          v-for="project in projectsState.userProjects"
          :key="project.id"
        >
          <router-link :to="{ name: 'ProjectContent', params: { projectId: project.id } }">
            <ProjectCard
              :id="project.id"
              :name="project.name"
              :users="project.users"
            />
          </router-link>
        </li>
        <li>
          <router-link
            to="/create-project"
            class="add-project"
          >
            <h2>Add Project</h2>
          </router-link>
        </li>
      </ul>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { signOut, userState } from '@/store/user';
import ProjectCard from '@/components/ProjectCard.vue';
import { projectsState, syncProjects } from '@/store/projects';
import router from '@/router';
import { displayError } from '@/store/error';

export default defineComponent({
  name: 'Home',
  components: {
    ProjectCard,
  },
  setup() {
    syncProjects().catch((error) => displayError(error));

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
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
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
