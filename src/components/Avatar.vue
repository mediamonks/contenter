<template>
  <div
    class="avatar"
    :class="{ 'inverted': isInverted, 'color-inverted': isColorInverted }"
  >
    <img
      :src="image"
      :alt="name"
      referrerpolicy="no-referrer"
    >
    <main>
      <h4 v-if="name">
        {{ name }}
      </h4>
      <p
        v-if="role"
        class="body-small"
      >
        {{ role }}
      </p>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isInverted: {
      type: Boolean,
      default: false,
    },
    isColorInverted: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: null,
    },
  },
});
</script>

<style lang="scss" scoped>
  @import "~@/assets/scss/variables";

  .avatar {
    display: flex;
    align-items: center;
    width: fit-content;

    img {
      width: 6rem;
      height: 6rem;
      border-radius: 100%;
      object-fit: cover;
      margin-right: 1rem;
      border: $colorGrey100 solid 1px;
    }

    p {
      text-transform: capitalize;
    }

    &.inverted {
      flex-direction: row-reverse;
      text-align: right;

      img {
        margin-right: 0;
        margin-left: 1rem;
      }
    }

    &.color-inverted {
      img {
        border-color: transparent;
      }

      h4 {
        color: $colorGrey050;
      }

      p {
        color: $colorGrey100;
      }
    }
  }
</style>
