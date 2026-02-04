<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  placeholder?: string;
  disabled?: boolean;
  modelValue?: string;
}>();

const emit = defineEmits<{
  search: [term: string];
  clear: [];
  'update:modelValue': [value: string];
}>();

const searchTerm = ref(props.modelValue || '');

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    searchTerm.value = newValue;
  }
});

// Watch searchTerm and emit update
watch(searchTerm, (newValue) => {
  emit('update:modelValue', newValue);
  emit('search', newValue);
});

const handleSearch = () => {
  emit('search', searchTerm.value);
};

const handleClear = () => {
  searchTerm.value = '';
  emit('clear');
};

const handleKeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch();
  } else if (e.key === 'Escape') {
    handleClear();
  }
};
</script>

<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="searchTerm"
        type="text"
        :placeholder="placeholder || 'Search fields or values...'"
        :disabled="disabled"
        @keyup="handleKeyup"
        class="search-input"
      />
      <button
        v-if="searchTerm"
        @click="handleClear"
        class="clear-btn"
        title="Clear search"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <button
      @click="handleSearch"
      :disabled="!searchTerm || disabled"
      class="search-btn"
    >
      Search
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  @apply flex gap-2 items-center;
}

.search-input-wrapper {
  @apply flex-1 relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.clear-btn {
  @apply absolute right-2 top-1/2 transform -translate-y-1/2;
  @apply p-1 text-gray-400 hover:text-gray-600 rounded;
  @apply transition-colors;
}

.search-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg;
  @apply hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors;
}
</style>
