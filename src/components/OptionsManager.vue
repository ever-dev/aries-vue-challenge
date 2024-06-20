<template>
  <form class="mt-4" @submit="emitUpdate">
    <div class="flex items-center justify-between">
      <h2 class="text-lg">Options</h2>

      <button class="border p-2 hover:bg-[#eee]" type="submit">
        Generate Graph
      </button>
    </div>
    <div class="grid grid-cols-2 gap-4 my-4">
      <OptionForm
        v-for="(option, index) in localOptions"
        :key="index"
        :index="index + 1"
        :option="option"
        :removeOption="() => removeOption(index)"
        @update-option="updateOption(index, $event)"
      />

      <button
        class="border border-dashed h-[282px]"
        type="button"
        v-if="localOptions.length < maxOptions"
        @click="addOption"
      >
        Add Option
      </button>
    </div>
  </form>
</template>

<script>
import OptionForm from "./OptionForm.vue";
import { MAX_NUMBER_OPTIONS } from "../constants.js";

export default {
  components: {
    OptionForm,
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      localOptions: JSON.parse(JSON.stringify(this.options)),
      maxOptions: MAX_NUMBER_OPTIONS,
    };
  },
  methods: {
    addOption() {
      if (this.localOptions.length < 4) {
        this.localOptions.push({
          strikePrice: 0,
          type: "Call",
          bid: 0,
          ask: 0,
          longShort: "long",
        });
      }
    },
    removeOption(index) {
      this.localOptions.splice(index, 1);
    },
    updateOption(index, payload) {
      this.$set(this.localOptions[index], payload.key, payload.value);
    },
    emitUpdate(ev) {
      ev.preventDefault();

      this.$emit("update-options", this.localOptions);
    },
  },
};
</script>
