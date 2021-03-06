<template>
  <div class="app">
    <ErrorDisplay />
    <NavigationPanel />
    <div class="router-wrapper">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavigationPanel from '@/components/NavigationPanel.vue';
import ErrorDisplay from '@/components/MessageDisplay.vue';
import { loadFirebaseAnalytics } from '@/firebase';

export default defineComponent({
  name: 'App',
  components: {
    NavigationPanel,
    ErrorDisplay,
  },
  setup() {
    loadFirebaseAnalytics().then((analytics) => {
      analytics.logEvent('app_startup');
    });
  },
});
</script>

<style lang="scss">
@import '~@/assets/scss/variables';
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.app {
  display: flex;

  .router-wrapper {
    width: 100%;
  }
}

html {
  font-size: 8px;
  box-sizing: border-box;

  color: $colorGrey600;
  background: $colorGrey050;
}

*,
*:before,
*:after {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: inherit;
  -webkit-tap-highlight-color: rgba(#000, 0);
}

body {
  font-size: 2rem;
  line-height: 3rem;
  margin: 0;
  padding: 0;
  font-family: Montserrat, sans-serif;

  &.no-scroll {
    overflow: hidden;
  }
}

h1,
h2,
h3,
h4,
h5,
h6,
p {
  font-weight: normal;
  margin: 0;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: $colorGrey900;
}

.title {
  font-size: 5rem;
  line-height: 6rem;
  font-weight: 600;
}

.subtitle {
  font-size: 2.5rem;
  line-height: 3rem;
  font-weight: 400;
  color: $colorGrey600;
}

h1 {
  font-size: 4rem;
  line-height: 5rem;
  font-weight: 700;
}

h2 {
  font-size: 3rem;
  line-height: 4rem;
  font-weight: 600;
}

h3 {
  font-size: 2.5rem;
  line-height: 3rem;
  font-weight: 600;
}

h4 {
  font-size: 2rem;
  line-height: 3rem;
  font-weight: 500;
}

h5 {
  font-size: 1.75rem;
  line-height: 2rem;
  font-weight: 500;
}

p {
  font-size: 2rem;
  line-height: 3rem;
}

code {
  font-family: monospace;
}

.icon {
  svg {
    height: 100%;
  }
}

.body- {
  &large {
    font-size: 2.25rem;
    line-height: 3rem;
  }

  &normal {
    font-size: 2rem;
    line-height: 3rem;
  }

  &small {
    font-size: 1.75rem;
    line-height: 2rem;
  }
}

button,
input,
textarea,
select {
  font-family: Montserrat, sans-serif;
}

ul,
ol {
  margin: 0;
  padding: 0;
}

img {
  display: block;
}

input,
select,
textarea {
  font-size: 2rem;
  padding: 1rem;
  border: solid 1px $colorGrey100;
  border-radius: 0.5rem;
  transition: border-color 0.1s ease-out;
  width: calc(100% - 2rem);
  background: $colorGrey050;

  &:focus {
    outline: none;
    border-color: $colorBlue400;
  }
}

select {
  cursor: pointer;
  margin-left: 0;
}

label {
  font-weight: 600;
  color: $colorGrey900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 2rem;
  line-height: 3rem;
}

*:focus:not(:focus-visible) {
  outline: none;
}
</style>
