<template>
  <router-view />
</template>

<style lang="scss">
@import '~@/assets/scss/variables';
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

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
  font-family: Montserrat, sans-serif;
}

body {
  font-size: 2rem;
  line-height: 3rem;
  margin: 0;
  padding: 0;

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
  font-size: 7rem;
  line-height: 8rem;
  font-weight: 600;
}

.subtitle {
  font-size: 2.5rem;
  line-height: 3rem;
  font-weight: 400;
  color: $colorGrey600;
}

h1 {
  font-size: 5rem;
  line-height: 6rem;
  font-weight: 700;
}

h2 {
  font-size: 4rem;
  line-height: 5rem;
  font-weight: 600;
}

h3 {
  font-size: 3rem;
  line-height: 4rem;
  font-weight: 600;
}

h4 {
  font-size: 3rem;
  line-height: 4rem;
  font-weight: 500;
}

h5 {
  font-size: 2.5rem;
  line-height: 3rem;
  font-weight: 500;
}

ul,
ol {
  margin: 0;
  padding: 0;
}

img {
  display: block;
}
</style>
