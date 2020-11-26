<template>
  <aside
    v-if="userState.currentUser"
    class="navigation-panel"
  >
    <header>
      <h3>MM Content Manager</h3>
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
                name: 'ProjectLocaleList',
                params: { projectId: router.currentRoute.value.params.projectId },
              }"
            >
              <Edit /> Content
            </router-link>
          </li>
          <li>
            <router-link
              :to="{
                name: 'ProjectAssets',
                params: { projectId: router.currentRoute.value.params.projectId },
              }"
            >
              <PhotoVideo /> Assets
            </router-link>
          </li>
          <li>
            <router-link
              :to="{
                name: 'ProjectSchema',
                params: { projectId: router.currentRoute.value.params.projectId },
              }"
            >
              <Database /> Schema
            </router-link>
          </li>
          <li>
            <router-link
              :to="{
                name: 'ProjectSettings',
                params: { projectId: router.currentRoute.value.params.projectId },
              }"
            >
              <Cogs /> Settings
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
    <section class="issue-reporter-bar">
      <div>
        <h5>Found an issue?</h5>
        <p class="body-small">
          Report it on GitHub
        </p>
      </div>
      <a
        href="https://github.com/MickJasker/MM-Content-Manager/issues"
        target="_blank"
        referrerpolicy="no-referrer"
        @click="logGitHubClick"
      ><GitHub /></a>
    </section>
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
import PhotoVideo from '@/assets/icons/PhotoVideo.vue';
import Database from '@/assets/icons/Database.vue';
import Cogs from '@/assets/icons/Cogs.vue';
import GitHub from '@/assets/icons/GitHub.vue';
import router from '@/router';
import { displayError } from '@/store/message';
import { loadFirebaseAnalytics } from '@/firebase';

export default defineComponent({
  name: 'NavigationPanel',
  components: {
    Avatar,
    ArrowToLeft,
    Task,
    LayerPlus,
    Edit,
    PhotoVideo,
    Database,
    Cogs,
    GitHub,
  },
  setup() {
    function handleSignOut() {
      signOut()
        .then(() => router.push('/sign-in'))
        .catch((error) => displayError(error));
    }

    async function logGitHubClick(event: Event) {
      const element = event.currentTarget as HTMLAnchorElement;
      const analytics = await loadFirebaseAnalytics();
      analytics.logEvent('click_link', {
        to: element.attributes.getNamedItem('href'),
      });
    }

    return {
      userState,
      router,
      handleSignOut,
      logGitHubClick,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import "~@/assets/scss/variables";

  .navigation-panel {
    max-width: 38rem;
    width: 100%;
    height: 100vh;
    background: $colorGrey700;
    color: $colorGrey050;
    display: grid;
    grid-template-rows: 13rem auto 15rem 12rem;
    z-index: 10;

    > * {
      width: 100%;
      height: fit-content;

      &:not(:last-child) {
        border-bottom: solid 1px $colorGrey500;
      }
    }

    header {
      padding: 3rem;
      height: 13rem;
      display: flex;
      align-items: center;

      h3 {
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
        padding: 0 3rem;
        margin: 3rem 0 1rem;
        color: $colorGrey050;
      }

      ul {
        list-style: none;
        padding: 0 0 3rem;

        li {
          width: 100%;
        }

        a {
          color: $colorGrey100;
          text-decoration: none;
          font-weight: 600;
          font-size: 2.25rem;
          line-height: 1em;
          width: 100%;
          transition: background-color 0.1s ease-out;
          padding: 1rem 3rem;
          display: flex;
          align-items: center;
          height: calc(1em + 2 * 1.5rem);

          .icon {
            height: 1em;
            width: 1.25em;
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
      padding: 3rem;
      height: 100%;

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

    .issue-reporter-bar {
      padding: 0 3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;

      h5 {
        color: $colorGrey050;
      }

      p {
        color: $colorGrey400;
      }

      a {
        display: block;
        width: 3rem;
        color: $colorGrey400;
        transition: 0.2s ease-out;

        &:hover {
          color: $colorGrey200;
        }
      }
    }
  }
</style>
