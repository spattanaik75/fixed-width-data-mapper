<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FieldMapping } from '../types';

const props = defineProps<{
  field?: FieldMapping;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [field: FieldMapping];
}>();

const formData = ref<FieldMapping>({
  element: '',
  value: '',
  description: '',
  type: 'CHR',
  positionStart: 1,
  positionEnd: 1,
  length: 1,
  preview: ''
});

const errors = ref<Record<string, string>>({});

watch(() => props.field, (newField) => {
  if (newField) {
    formData.value = { ...newField };
  }
}, { immediate: true });

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.field) {
    // Reset for new field
    formData.value = {
      element: '',
      value: '',
      description: '',
      type: 'CHR',
      positionStart: 1,
      positionEnd: 1,
      length: 1,
      preview: ''
    };
    errors.value = {};
  }
});

// Auto-calculate length when positions change
watch([() => formData.value.positionStart, () => formData.value.positionEnd], ([start, end]) => {
  if (start && end && end >= start) {
    formData.value.length = end - start + 1;
  }
});

const validate = (): boolean => {
  errors.value = {};
  
  if (!formData.value.element.trim()) {
    errors.value.element = 'Element is required';
  }
  
  if (formData.value.positionStart < 1) {
    errors.value.positionStart = 'Position must be >= 1';
  }
  
  if (formData.value.positionEnd < formData.value.positionStart) {
    errors.value.positionEnd = 'End must be >= start';
  }
  
  if (formData.value.length <= 0) {
    errors.value.length = 'Length must be > 0';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSave = () => {
  if (validate()) {
    emit('save', { ...formData.value });
  }
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ field ? 'Edit Field' : 'Add Field' }}
        </h2>
        <button @click="handleClose" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-grid">
          <!-- Element -->
          <div class="form-group">
            <label class="form-label">Element *</label>
            <input
              v-model="formData.element"
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.element }"
              placeholder="e.g., A1"
            />
            <span v-if="errors.element" class="error-text">{{ errors.element }}</span>
          </div>

          <!-- Value -->
          <div class="form-group">
            <label class="form-label">Value</label>
            <input
              v-model="formData.value"
              type="text"
              class="form-input"
              placeholder="Field value"
            />
          </div>

          <!-- Type -->
          <div class="form-group">
            <label class="form-label">Type *</label>
            <select v-model="formData.type" class="form-input">
              <option value="CHR">CHR - Character</option>
              <option value="FCV">FCV - Numeric Value</option>
              <option value="FCD">FCD - Date</option>
              <option value="FCR">FCR - Record</option>
              <option value="NUM">NUM - Number</option>
              <option value="SED">SED - SEDOL</option>
            </select>
          </div>

          <!-- Position Start -->
          <div class="form-group">
            <label class="form-label">Position Start *</label>
            <input
              v-model.number="formData.positionStart"
              type="number"
              min="1"
              class="form-input"
              :class="{ 'input-error': errors.positionStart }"
            />
            <span v-if="errors.positionStart" class="error-text">{{ errors.positionStart }}</span>
          </div>

          <!-- Position End -->
          <div class="form-group">
            <label class="form-label">Position End *</label>
            <input
              v-model.number="formData.positionEnd"
              type="number"
              :min="formData.positionStart"
              class="form-input"
              :class="{ 'input-error': errors.positionEnd }"
            />
            <span v-if="errors.positionEnd" class="error-text">{{ errors.positionEnd }}</span>
          </div>

          <!-- Length (auto-calculated) -->
          <div class="form-group">
            <label class="form-label">Length</label>
            <input
              v-model.number="formData.length"
              type="number"
              class="form-input bg-gray-100"
              readonly
            />
          </div>

          <!-- Description (full width) -->
          <div class="form-group col-span-2">
            <label class="form-label">Description</label>
            <textarea
              v-model="formData.description"
              class="form-input"
              rows="2"
              placeholder="Field description"
            ></textarea>
          </div>

          <!-- Preview (full width) -->
          <div class="form-group col-span-2">
            <label class="form-label">Preview</label>
            <input
              v-model="formData.preview"
              type="text"
              class="form-input font-mono"
              placeholder="e.g., *******"
            />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="btn-secondary">
          Cancel
        </button>
        <button @click="handleSave" class="btn-primary">
          {{ field ? 'Update' : 'Add' }} Field
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.close-btn {
  @apply text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6 overflow-y-auto;
}

.modal-footer {
  @apply flex items-center justify-end gap-3 p-6 border-t border-gray-200;
}

.form-grid {
  @apply grid grid-cols-2 gap-4;
}

.form-group {
  @apply flex flex-col;
}

.form-label {
  @apply text-sm font-medium text-gray-700 mb-1;
}

.form-input {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.input-error {
  @apply border-red-500 focus:ring-red-500;
}

.error-text {
  @apply text-xs text-red-600 mt-1;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors;
}
</style>
