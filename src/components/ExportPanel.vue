<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  exportMapperCSV: [];
  exportMapperExcel: [];
  exportDataCSV: [];
  exportValidation: [];
  exportAll: [];
}>();
</script>

<template>
  <div class="export-panel">
    <h3 class="panel-title">Export Options</h3>
    
    <div class="export-buttons">
      <!-- Mapper Exports -->
      <div class="export-section">
        <h4 class="section-label">Mapper</h4>
        <button
          @click="emit('exportMapperCSV')"
          :disabled="disabled || loading"
          class="export-btn"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as CSV
        </button>
        <button
          @click="emit('exportMapperExcel')"
          :disabled="disabled || loading"
          class="export-btn"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as Excel
        </button>
      </div>

      <!-- Data Export -->
      <div class="export-section">
        <h4 class="section-label">Parsed Data</h4>
        <button
          @click="emit('exportDataCSV')"
          :disabled="disabled || loading"
          class="export-btn"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Data as CSV
        </button>
      </div>

      <!-- Validation Report -->
      <div class="export-section">
        <h4 class="section-label">Validation</h4>
        <button
          @click="emit('exportValidation')"
          :disabled="disabled || loading"
          class="export-btn"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Export Validation Report
        </button>
      </div>

      <!-- Export All -->
      <div class="export-section">
        <button
          @click="emit('exportAll')"
          :disabled="disabled || loading"
          class="export-btn export-all-btn"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Export Everything
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.export-panel {
  @apply bg-white rounded-lg shadow-md p-4;
}

.panel-title {
  @apply text-lg font-semibold text-gray-800 mb-4;
}

.export-buttons {
  @apply space-y-4;
}

.export-section {
  @apply space-y-2;
}

.section-label {
  @apply text-sm font-medium text-gray-700 mb-2;
}

.export-btn {
  @apply w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg;
  @apply hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors text-sm text-gray-700;
}

.export-all-btn {
  @apply bg-blue-600 text-white border-blue-600;
  @apply hover:bg-blue-700;
}
</style>
