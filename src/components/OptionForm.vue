<template>
  <div class="grid grid-cols-1 gap-2 flex-1 border border-solid p-4 shadow-md">
    <div class="flex items-center justify-between">
      <h3>Option {{ index }}</h3>
      <button
        class="p-2"
        type="button"
        @click="removeOption"
      >
        X
      </button>
    </div>
    <input
      required
      class="border border-solid p-1"
      :value="option.strikePrice"
      @input="updateOption('strikePrice', +$event.target.value)"
      placeholder="Strike Price"
      step="0.01"
      type="number"
    />
    <select
      required
      class="border border-solid p-1"
      :value="option.type"
      @change="updateOption('type', $event.target.value)"
    >
      <option value="Call">Call</option>
      <option value="Put">Put</option>
    </select>
    <input
      required
      class="border border-solid p-1"
      :value="option.bid"
      @input="updateOption('bid', +$event.target.value)"
      placeholder="Bid"
      type="number"
      step="0.01"
    />
    <input
      required
      class="border border-solid p-1"
      :value="option.ask"
      @input="updateOption('ask', +$event.target.value)"
      placeholder="Ask"
      type="number"
      step="0.01"
    />
    <select
      required
      class="border border-solid p-1"
      :value="option.longShort"
      @change="updateOption('longShort', $event.target.value)"
    >
      <option value="long">Long</option>
      <option value="short">Short</option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    index: {
      type: Number,
    },
    option: {
      type: Object,
      required: true,
    },
    removeOption: {
      type: Function,
      required: true,
    },
  },
  methods: {
    updateOption(key, value) {
      this.$emit("update-option", { key, value });
    },
  },
};
</script>
