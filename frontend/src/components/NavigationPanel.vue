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
        <ul>
          <li>
            <router-link to="/">
              Projects
            </router-link>
          </li>
          <li>
            <router-link to="/create-project">
              Create Project
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
import router from '@/router';

export default defineComponent({
  name: 'NavigationPanel',
  components: {
    Avatar,
    ArrowToLeft,
  },
  setup() {
    function handleSignOut() {
      signOut()
        .then(() => router.push('/sign-in'))
        .catch((err) => console.error(err));
    }

    return {
      userState,
      handleSignOut,
    };
  },
});
</script>

<style lang="scss" scoped>
  @import "~@/assets/scss/variables";

  .navigation-panel {
    max-width: 54rem;
    width: 100%;
    height: 100vh;
    background: $colorGrey700;
    color: $colorGrey050;
    display: flex;
    flex-direction: column;

    > * {
      padding: 4rem;
      width: 100%;
      height: fit-content;

      &:not(:last-child) {
        border-bottom: solid 1px $colorGrey500;
      }
    }

    header {
      h3 {
        color: inherit;
      }
    }

    main {
      flex-basis: 100%;
    }

    nav ul {
      list-style: none;

      li:not(:last-child) {
        margin-bottom: 2rem;
      }

      a {
        color: $colorGrey100;
        text-decoration: none;
        font-weight: 600;
        font-size: 3rem;
        line-height: 1em;
        transition: color 0.1s ease-out;

        &:hover {
          color: $colorGrey050;
        }

        &.router-link-exact-active {
          color: $colorBlue400;
        }
      }
    }

    footer {
      display: flex;
      justify-content: space-between;

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
