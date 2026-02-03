<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FieldMapping } from '../types';
import FieldModal from './FieldModal.vue';

const props = defineProps<{
  mappings: FieldMapping[];
  loading?: boolean;
  highlightedField?: string;
  errors?: Map<string, string[]>;
}>();

const emit = defineEmits<{
  addField: [field: FieldMapping];
  editField: [field: FieldMapping];
  deleteField: [element: string];
  fieldClick: [element: string];
}>();

const isModalOpen = ref(false);
const editingField = ref<FieldMapping | undefined>(undefined);

const sortBy = ref<'position' | 'element'>('position');
const sortOrder = ref<'asc' | 'desc'>('asc');

const sortedMappings = computed(() => {
  const sorted = [...props.mappings];
  sorted.sort((a, b) => {
    let comparison = 0;
    if (sortBy.value === 'position') {
      comparison = a.positionStart - b.positionStart;
    } else {
      comparison = a.element.localeCompare(b.element);
    }
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
  return sorted;
});

const toggleSort = (field: 'position' | 'element') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};

const hasError = (element: string): boolean => {
  return props.errors?.has(element) || false;
};

const isHighlighted = (element: string): boolean => {
  return props.highlightedField === element;
};

const handleAddNew = () => {
  editingField.value = undefined;
  isModalOpen.value = true;
};

const handleEdit = (field: FieldMapping) => {
  editingField.value = field;
  isModalOpen.vahandleAddNew
};

const handleDelete = (element: string) => {
  if (confirm(`Delete field "${element}"?`)) {
    emit('deleteField', element);
  }
};

const handleSaveField = (field: FieldMapping) => {
  if (editingField.value) {
    emit('editField', field);
  } else {
    emit('addField', field);
  }
  isModalOpen.value = false;
  editingField.value = undefined;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  editingField.value = undefined;
};
</script>

<template>
  <div class="mapper-editor">
    <!-- Header -->
    <div class="editor-header">
      <h2 class="text-lg font-semibold text-gray-800">Field Mappings</h2>
      <button
        @click="emit('addField')"
        class="btn-primary"
        :disabled="loading"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Field
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <span class="stat-item">
        <span class="stat-label">Total Fields:</span>
        <span class="stat-value">{{ mappings.length }}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">Record Length:</span>
        <span class="stat-value">
          {{ mappings.length > 0 ? Math.max(...mappings.map(m => m.positionEnd)) : 0 }}
        </span>
      </span>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="mapper-table">
        <thead>
          <tr>
            <th @click="toggleSort('element')" class="sortable">
              Element
              <svg v-if="sortBy === 'element'" class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                <path :d="sortOrder === 'asc' ? 'M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z' : 'M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z'" />
              </svg>
            </th>
            <th>Value</th>
            <th>Description</th>
            <th>Type</th>
            <th @click="toggleSort('position')" class="sortable">
              Position
              <svg v-if="sortBy === 'position'" class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                <path :d="sortOrder === 'asc' ? 'M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z' : 'M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z'" />
              </svg>
            </th>
            <th>Length</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mapping in sortedMappings"
            :key="mapping.element"
            class="table-row"
            :class="{
              'highlighted': isHighlighted(mapping.element),
              'error-row': hasError(mapping.element)
            }"
            @click="emit('fieldClick', mapping.element)"
          >
            <td class="font-medium text-gray-900">{{ mapping.element }}</td>
            <td class="text-gray-700">{{ mapping.value }}</td>
            <td class="text-gray-600 text-sm">{{ mapping.description }}</td>
            <td>
              <span class="type-badge">{{ mapping.type }}</span>
            </td>
            <td class="text-sm text-gray-600">
              {{ mapping.positionStart }} - {{ mapping.positionEnd }}
            </td>
            <td class="text-center text-gray-700">{{ mapping.length }}</td>
            <td>
              <div class="action-buttons">
                <button
                  @click.stop="handleEdit(mapping)"
                  class="btn-icon text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click.stop="handleDelete(mapping.element)"
                  class="btn-icon text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="mappings.length === 0" class="empty-state">
        <svg class="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-600">No mappings loaded</p>
        <p class="text-sm text-gray-500">Upload a mapper file to get started</p>
      </div>
    </div>

    <FieldModal
      :field="editingField"
      :is-open="isModalOpen"
      @close="handleCloseModal"
      @save="handleSaveField"
    />
  </div>
</template>

<style scoped>
.mapper-editor {
  @apply bg-white rounded-lg shadow-md h-full flex flex-col;
}

.editor-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.btn-primary {
  @apply flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg;
  @apply hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.stats-bar {
  @apply flex gap-6 px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm;
}

.stat-item {
  @apply flex gap-2;
}

.stat-label {
  @apply text-gray-600;
}

.stat-value {
  @apply font-semibold text-gray-900;
}

.table-container {
  @apply flex-1 overflow-auto p-4;
}

.mapper-table {
  @apply w-full border-collapse;
}

.mapper-table thead {
  @apply sticky top-0 bg-gray-50 z-10;
}

.mapper-table th {
  @apply px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider;
  @apply border-b-2 border-gray-200;
}

.mapper-table th.sortable {
  @apply cursor-pointer hover:bg-gray-100 select-none;
}

.mapper-table td {
  @apply px-4 py-3 border-b border-gray-200;
}

.table-row {
  @apply cursor-pointer hover:bg-blue-50 transition-colors;
}

.table-row.highlighted {
  @apply bg-yellow-100 hover:bg-yellow-200;
}

.table-row.error-row {
  @apply bg-red-50 hover:bg-red-100;
}

.type-badge {
  @apply inline-block px-2 py-1 text-xs font-medium rounded;
  @apply bg-purple-100 text-purple-800;
}

.action-buttons {
  @apply flex gap-2 justify-center;
}

.btn-icon {
  @apply p-1 rounded hover:bg-gray-100 transition-colors;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}
</style>
