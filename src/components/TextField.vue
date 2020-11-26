<template>
  <label class="text-field">
    <span class="label-copy">
      {{ label }}
    </span>
    <input
      v-bind="$attrs"
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <span
      v-if="error"
      class="error body-small"
    >{{ error }}</span>
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TextField',
  props: {
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: null,
    },
  },
  emits: [
    'update:modelValue',
  ],
});
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/variables';

  .text-field {
    display: block;
    width: 100%;

    input {
      display: block;
      width: 100%;
      padding: 1.5rem;
      border: solid 1px $colorGrey100;
      border-radius: 0.5rem;
      font-size: 2.25rem;
      line-height: 3rem;
      transition: border-color 0.2s ease-out;

      &:focus {
        outline: none;
        border-color: $colorBlue400;
      }
    }

    .error {
      position: absolute;
      color: $colorError;
    }
  }
</style>
