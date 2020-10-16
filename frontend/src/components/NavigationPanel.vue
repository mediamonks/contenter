<template>
  <aside
    v-if="userState.currentUser"
    class="navigation-panel"
  >
    <header>
      <h2>MM Content Manager</h2>
    </header>
    <main>
      <nav class="global-navigation">
        <h3>Global</h3>
        <ul>
          <li>
            <router-link to="/">
              <Task /> Projects
            </router-link>
          </li>
          <li>
            <router-link to="/create-project">
              <LayerPlus /> Create Project
            </router-link>
          </li>
        </ul>
      </nav>
      <nav
        v-if="router.currentRoute.value.params.projectId"
        class="project-navigation"
      >
        <h3>Project</h3>
        <ul>
          <li>
            <router-link
              :to="{
                name: 'ProjectContent',
                params: { projectId: router.currentRoute.value.params.projectId } }"
            >
              <Edit /> Content
            </router-link>
          </li>
          <li>
            <router-link
              :to="{
                name: 'ProjectSchema',
                params: { projectId: router.currentRoute.value.params.projectId } }"
            >
              <Database /> Schema
            </router-link>
          </li>
        </ul>
      </nav>
    </main>
    <footer>
      <Avatar
        color-inverted
        :image="userState.currentUser.photoURL"
        :name="userState.currentUser.displayName"
        :role="userState.currentUser.role"
      />
      <div class="options">
        <ArrowToLeft
          class="sign-out-icon"
          @click="handleSignOut"
        />
      </div>
    </footer>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { signOut, userState } from '@/store/user';
import Avatar from '@/components/Avatar.vue';
import ArrowToLeft from '@/assets/icons/ArrowToLeft.vue';
import Task from '@/assets/icons/Task.vue';
import LayerPlus from '@/assets/icons/LayersPlus.vue';
import Edit from '@/assets/icons/Edit.vue';
import Database from '@/assets/icons/Database.vue';
import router from '@/router';
import { displayError } from '@/store/error';

export default defineComponent({
  name: 'NavigationPanel',
  components: {
    Avatar,
    ArrowToLeft,
    Task,
    LayerPlus,
    Edit,
    Database,
  },
  setup() {
    function handleSignOut() {
      signOut()
        .then(() => router.push('/sign-in'))
        .catch((error) => displayError(error));
    }

    return {
      userState,
      router,
      handleSignOut,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import "~@/assets/scss/variables";

  .navigation-panel {
    min-width: 54rem;
    max-width: 54rem;
    width: 100%;
    height: 100vh;
    background: $colorGrey700;
    color: $colorGrey050;
    display: grid;
    grid-template-rows: 13rem auto 15rem;
    z-index: 10;

    > * {
      width: 100%;
      height: fit-content;

      &:not(:last-child) {
        border-bottom: solid 1px $colorGrey500;
      }
    }

    header {
      padding: 4rem;
      height: 13rem;
      display: flex;
      align-items: center;

      h2 {
        color: inherit;
      }
    }

    main {
      flex-basis: 100%;

      > * {
        width: 100%;
        height: fit-content;

        &:not(:last-child) {
          border-bottom: solid 1px $colorGrey500;
        }
      }
    }

    nav {
      h3 {
        padding: 0 4rem;
        margin: 4rem 0 1rem;
        color: $colorGrey050;
      }

      ul {
        list-style: none;
        padding: 0 0 4rem;

        li {
          width: 100%;
        }

        a {
          color: $colorGrey100;
          text-decoration: none;
          font-weight: 600;
          font-size: 2.5rem;
          line-height: 1em;
          width: 100%;
          transition: background-color 0.1s ease-out;
          padding: 1.5rem 4rem;
          display: flex;
          align-items: center;
          height: calc(1em + 2 * 1.5rem);

          .icon {
            width: 1em;
            margin-right: 2rem;
          }

          &:hover {
            background: $colorGrey600;
          }

          &.router-link-exact-active {
            color: $colorBlue400;
          }
        }
      }
    }

    footer {
      display: flex;
      justify-content: space-between;
      padding: 4rem;

      .options {
        display: flex;
        align-items: center;

        .sign-out-icon {
          width: 3rem;
          color: $colorGrey100;
          transition: color 0.1s ease-out;
          cursor: pointer;
          position: relative;
          height: fit-content;

          &:before {
            content: 'Sign Out';
            position: absolute;
            left: 5rem;
            font-size: 1.75rem;
            white-space: nowrap;
            background: $colorGrey900;
            padding: 0.75rem;
            color: $colorGrey050;
            border-radius: 0.5rem;
            box-shadow: 0 1rem 2rem rgba(black, 0.15), 0 0 2rem rgba(black, 0.15);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease;
            line-height: 1em;
          }

          &:hover {
            color: $colorGrey050;

            &:before {
              opacity: 1;
              visibility: visible;
            }
          }
        }
      }
    }
  }
</style>
