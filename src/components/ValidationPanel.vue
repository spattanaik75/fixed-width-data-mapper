<script setup lang="ts">
import { computed } from 'vue';
import type { ValidationError } from '../types';

const props = defineProps<{
  errors: ValidationError[];
  warnings: ValidationError[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  jumpToField: [fieldName: string, recordNumber?: number];
}>();

const totalIssues = computed(() => props.errors.length + props.warnings.length);

const statusColor = computed(() => {
  if (props.errors.length > 0) return 'red';
  if (props.warnings.length > 0) return 'yellow';
  return 'green';
});

const statusText = computed(() => {
  if (props.errors.length > 0) return 'Issues Found';
  if (props.warnings.length > 0) return 'Warnings Found';
  return 'All Good';
});

const handleJumpToField = (fieldName: string, recordNumber?: number) => {
  emit('jumpToField', fieldName, recordNumber);
};
</script>

<template>
  <div class="validation-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2 class="text-lg font-semibold text-gray-800">Validation</h2>
      <div
        class="status-badge"
        :class="`bg-${statusColor}-100 text-${statusColor}-800`"
      >
        <span class="status-dot" :class="`bg-${statusColor}-500`"></span>
        {{ statusText }}
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value text-red-600">{{ errors.length }}</div>
        <div class="stat-label">Errors</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-yellow-600">{{ warnings.length }}</div>
        <div class="stat-label">Warnings</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-gray-600">{{ totalIssues }}</div>
        <div class="stat-label">Total</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p class="text-sm text-gray-600">Validating...</p>
    </div>

    <!-- No Issues -->
    <div v-else-if="totalIssues === 0" class="empty-state">
      <svg class="w-16 h-16 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-gray-600">No validation issues found!</p>
    </div>

    <!-- Issues List -->
    <div v-else class="issues-list">
      <!-- Errors -->
      <div v-if="errors.length > 0" class="issue-section">
        <h3 class="section-title text-red-700">
          Errors 
          <span class="text-xs font-normal text-gray-500 ml-2">(click to filter)</span>
        </h3>
        <div
          v-for="(error, idx) in errors"
          :key="`error-${idx}`"
          class="issue-item error"
          @click="handleJumpToField(error.field, error.line)"
        >
          <div class="issue-icon">
            <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="issue-content">
            <div class="issue-field">
              {{ error.field }}
              <span v-if="error.line" class="text-xs text-red-600 ml-2 font-normal">(Record #{{ error.line }})</span>
            </div>
            <div class="issue-message">{{ error.message }}</div>
          </div>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="warnings.length > 0" class="issue-section">
        <h3 class="section-title text-yellow-700">
          Warnings
          <span class="text-xs font-normal text-gray-500 ml-2">(click to filter)</span>
        </h3>
        <div
          v-for="(warning, idx) in warnings"
          :key="`warning-${idx}`"
          class="issue-item warning"
          @click="handleJumpToField(warning.field, warning.line)"
        >
          <div class="issue-icon">
            <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="issue-content">
            <div class="issue-field">
              {{ warning.field }}
              <span v-if="warning.line" class="text-xs text-yellow-600 ml-2 font-normal">(Record #{{ warning.line }})</span>
            </div>
            <div class="issue-message">{{ warning.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.validation-panel {
  @apply bg-white rounded-lg shadow-md p-4 h-full flex flex-col overflow-hidden;
}

.panel-header {
  @apply flex items-center justify-between mb-4;
}

.status-badge {
  @apply px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2;
}

.status-dot {
  @apply w-2 h-2 rounded-full;
}

.stats-grid {
  @apply grid grid-cols-3 gap-3 mb-4;
}

.stat-card {
  @apply bg-gray-50 rounded-lg p-3 text-center;
}

.stat-value {
  @apply text-2xl font-bold;
}

.stat-label {
  @apply text-xs text-gray-600 mt-1;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-8;
}

.spinner {
  @apply w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-8 text-center;
}

.issues-list {
  @apply flex-1 overflow-y-auto space-y-4 max-h-full;
}

.issue-section {
  @apply space-y-2;
}

.section-title {
  @apply text-sm font-semibold mb-2;
}

.issue-item {
  @apply flex gap-3 p-3 rounded-lg cursor-pointer transition-colors;
  @apply hover:bg-gray-50;
}

.issue-item.error {
  @apply bg-red-50 hover:bg-red-100;
}

.issue-item.warning {
  @apply bg-yellow-50 hover:bg-yellow-100;
}

.issue-icon {
  @apply flex-shrink-0;
}

.issue-content {
  @apply flex-1 min-w-0;
}

.issue-field {
  @apply text-sm font-medium text-gray-900 truncate;
}

.issue-message {
  @apply text-xs text-gray-600 mt-1;
}
</style>
