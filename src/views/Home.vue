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
          <router-link :to="{ name: 'ProjectLocaleList', params: { projectId: project.id } }">
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
import { projectsState, syncProjectsMetadata } from '@/store/projects';
import router, { RouteNames } from '@/router';
import { displayError } from '@/store/message';

export default defineComponent({
  name: 'Home',
  components: {
    ProjectCard,
  },
  setup() {
    syncProjectsMetadata().catch((error) => displayError(error));

    async function handleSignOut() {
      await signOut();
      await router.push({ name: RouteNames.SIGN_IN });
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
    height: 100vh;
    padding: 6rem 0;
    overflow-y: auto;

    main {
      max-width: 166rem;
      margin: 0 auto;
      padding: 0 3rem;

      ul {
        margin-top: 3rem;
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

          &:hover, &:focus {
            outline: none;
            border-color: $colorBlue400;
          }
        }
      }
    }
  }
</style>
