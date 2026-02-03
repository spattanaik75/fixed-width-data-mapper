<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ParsedRecord, FieldMapping } from '../types';

const props = defineProps<{
  records: ParsedRecord[];
  mappings: FieldMapping[];
  currentPage?: number;
  recordsPerPage?: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
  recordsPerPageChange: [count: number];
}>();

const page = ref(props.currentPage || 1);
const perPage = ref(props.recordsPerPage || 10);

const totalPages = computed(() => {
  return Math.ceil(props.records.length / perPage.value);
});

const paginatedRecords = computed(() => {
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return props.records.slice(start, end);
});

const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
    emit('pageChange', newPage);
  }
};

const changePerPage = (count: number) => {
  perPage.value = count;
  page.value = 1;
  emit('recordsPerPageChange', count);
};

const isFieldEmpty = (value: string): boolean => {
  if (!value || value.trim() === '') return true;
  const trimmed = value.trim();
  if (/^9+$/.test(trimmed)) return true;
  if (/^_+$/.test(trimmed)) return true;
  if (/^\*+$/.test(trimmed)) return true;
  return false;
};

const getFieldGroup = (element: string): string => {
  // Simple grouping logic - you can customize this
  if (element.includes('RATE') || element.includes('PRICE')) return 'Pricing';
  if (element.includes('DATE') || element.includes('TIME')) return 'Temporal';
  if (element.includes('ID') || element.includes('CODE')) return 'Identifiers';
  return 'Other';
};

const groupedFields = computed(() => {
  const groups: Record<string, FieldMapping[]> = {
    'Identifiers': [],
    'Pricing': [],
    'Temporal': [],
    'Other': []
  };
  
  props.mappings.forEach(mapping => {
    const group = getFieldGroup(mapping.element);
    if (groups[group]) {
      groups[group].push(mapping);
    }
  });
  
  return Object.entries(groups).filter(([_, fields]) => fields.length > 0);
});
</script>

<template>
  <div class="data-viewer">
    <!-- Header -->
    <div class="viewer-header">
      <h2 class="text-lg font-semibold text-gray-800">Parsed Data</h2>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">
          {{ records.length }} record{{ records.length !== 1 ? 's' : '' }}
        </span>
        <select
          v-model="perPage"
          @change="changePerPage(perPage)"
          class="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option :value="5">5 per page</option>
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p class="text-sm text-gray-600">Loading data...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="records.length === 0" class="empty-state">
      <svg class="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-gray-600">No data loaded</p>
      <p class="text-sm text-gray-500">Upload a data file to view parsed records</p>
    </div>

    <!-- Records -->
    <div v-else class="records-container">
      <div
        v-for="(record, idx) in paginatedRecords"
        :key="idx"
        class="record-card"
      >
        <div class="record-header">
          <span class="record-number">
            Record #{{ (page - 1) * perPage + idx + 1 }}
          </span>
        </div>
        
        <div class="record-body">
          <div
            v-for="[groupName, fields] in groupedFields"
            :key="groupName"
            class="field-group"
          >
            <h3 class="group-title">{{ groupName }}</h3>
            <div class="fields-grid">
              <div
                v-for="field in fields"
                :key="field.element"
                class="field-item"
                :class="{ 'field-empty': isFieldEmpty(record[field.element]?.value || '') }"
              >
                <div class="field-label">
                  <span class="font-medium">{{ field.element }}</span>
                  <span class="text-xs text-gray-500">{{ field.type }}</span>
                </div>
                <div class="field-value">
                  {{ record[field.element]?.value || '—' }}
                </div>
                <div class="field-description">
                  {{ field.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button
          @click="changePage(page - 1)"
          :disabled="page === 1"
          class="pagination-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span class="pagination-info">
          Page {{ page }} of {{ totalPages }}
        </span>
        
        <button
          @click="changePage(page + 1)"
          :disabled="page === totalPages"
          class="pagination-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-viewer {
  @apply bg-white rounded-lg shadow-md h-full flex flex-col;
}

.viewer-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-12;
}

.spinner {
  @apply w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.records-container {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.record-card {
  @apply bg-gray-50 rounded-lg border border-gray-200 overflow-hidden;
}

.record-header {
  @apply px-4 py-2 bg-blue-600 text-white font-medium;
}

.record-number {
  @apply text-sm;
}

.record-body {
  @apply p-4 space-y-4;
}

.field-group {
  @apply space-y-2;
}

.group-title {
  @apply text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-300 pb-1;
}

.fields-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3;
}

.field-item {
  @apply bg-white p-3 rounded border border-gray-200;
}

.field-item.field-empty {
  @apply bg-gray-100 opacity-60;
}

.field-label {
  @apply flex items-center justify-between mb-1;
}

.field-value {
  @apply text-sm text-gray-900 font-mono mb-1 break-all;
}

.field-description {
  @apply text-xs text-gray-500;
}

.pagination {
  @apply flex items-center justify-center gap-4 p-4 border-t border-gray-200;
}

.pagination-btn {
  @apply p-2 rounded-lg border border-gray-300 hover:bg-gray-100;
  @apply disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.pagination-info {
  @apply text-sm text-gray-700 font-medium;
}
</style>
