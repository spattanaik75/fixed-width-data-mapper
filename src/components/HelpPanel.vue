<script setup lang="ts">
import { ref } from 'vue';

const isExpanded = ref(false);

const toggleHelp = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="help-panel">
    <button @click="toggleHelp" class="help-toggle">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Help & Shortcuts</span>
      <svg 
        class="w-4 h-4 transition-transform" 
        :class="{ 'rotate-180': isExpanded }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="expand">
      <div v-if="isExpanded" class="help-content">
        <div class="help-section">
          <h3 class="help-heading">Quick Start</h3>
          <ol class="help-list-ordered">
            <li>Upload a mapper CSV file with field definitions</li>
            <li>Upload a fixed-width data file to parse</li>
            <li>View parsed records and validation errors</li>
            <li>Edit, add, or delete field mappings</li>
            <li>Export your data in various formats</li>
          </ol>
        </div>

        <div class="help-section">
          <h3 class="help-heading">Mapper File Format</h3>
          <p class="help-text">CSV file with the following columns:</p>
          <ul class="help-list">
            <li><strong>Element:</strong> Field identifier (e.g., A1, B2)</li>
            <li><strong>Value:</strong> Optional field value</li>
            <li><strong>Description:</strong> Human-readable field name</li>
            <li><strong>Type:</strong> Data type (CHR, FCV, FCD, etc.)</li>
            <li><strong>Position:</strong> Field position (e.g., "1 to 10")</li>
            <li><strong>Length:</strong> Field length in characters</li>
          </ul>
        </div>

        <div class="help-section">
          <h3 class="help-heading">Field Types</h3>
          <ul class="help-list">
            <li><strong>CHR:</strong> Character/String field</li>
            <li><strong>FCV:</strong> Numeric value (e.g., prices)</li>
            <li><strong>FCD:</strong> Date field (YYYYMMDD)</li>
            <li><strong>FCR:</strong> Record identifier</li>
            <li><strong>NUM:</strong> General numeric field</li>
            <li><strong>SED:</strong> SEDOL code</li>
          </ul>
        </div>

        <div class="help-section">
          <h3 class="help-heading">Keyboard Shortcuts</h3>
          <ul class="help-list">
            <li><kbd>Ctrl+S</kbd> / <kbd>⌘S</kbd> - Auto-save session</li>
            <li><kbd>Enter</kbd> - Search (in search box)</li>
            <li><kbd>Escape</kbd> - Clear search</li>
          </ul>
        </div>

        <div class="help-section">
          <h3 class="help-heading">Validation</h3>
          <p class="help-text">The app automatically checks for:</p>
          <ul class="help-list">
            <li>Overlapping field positions</li>
            <li>Gaps in position ranges</li>
            <li>Empty or placeholder values (9999..., underscores)</li>
            <li>Invalid date formats</li>
            <li>Type-specific validation</li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.help-panel {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
}

.help-toggle {
  @apply w-full flex items-center gap-3 px-4 py-3 text-left;
  @apply text-gray-700 hover:bg-gray-50 transition-colors;
}

.help-content {
  @apply px-4 pb-4 space-y-4 border-t border-gray-200;
}

.help-section {
  @apply pt-4;
}

.help-heading {
  @apply text-sm font-semibold text-gray-900 mb-2;
}

.help-text {
  @apply text-sm text-gray-600 mb-2;
}

.help-list {
  @apply text-sm text-gray-600 space-y-1 pl-5 list-disc;
}

.help-list-ordered {
  @apply text-sm text-gray-600 space-y-1 pl-5 list-decimal;
}

.help-list li {
  @apply leading-relaxed;
}

kbd {
  @apply px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>
