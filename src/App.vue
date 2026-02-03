<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import FileUploader from './components/FileUploader.vue';
import MapperEditor from './components/MapperEditor.vue';
import DataViewer from './components/DataViewer.vue';
import ValidationPanel from './components/ValidationPanel.vue';
import SearchBar from './components/SearchBar.vue';
import ExportPanel from './components/ExportPanel.vue';
import HelpPanel from './components/HelpPanel.vue';
import Toast from './components/Toast.vue';
import { useFileParser } from './composables/useFileParser';
import { useValidation } from './composables/useValidation';
import { useExport } from './composables/useExport';
import { useToast } from './composables/useToast';
import { useLocalStorage } from './composables/useLocalStorage';
import type { FieldMapping } from './types';

// Composables
const fileParser = useFileParser();
const validation = useValidation();
const exportTools = useExport();
const toast = useToast();
const storage = useLocalStorage();

// State
const searchTerm = ref('');
const highlightedField = ref<string | null>(null);
const currentPage = ref(1);
const recordsPerPage = ref(10);

// Upload handlers
const handleMapperUpload = async (file: File) => {
  try {
    await fileParser.parseMapperFile(file);
    validation.validate(fileParser.mappings.value, fileParser.parsedRecords.value);
    toast.success(`Loaded ${fileParser.mappings.value.length} field mappings`);
    triggerAutoSave();
  } catch (error) {
    console.error('Failed to upload mapper:', error);
    toast.error('Failed to parse mapper file');
  }
};

const handleDataUpload = async (file: File) => {
  try {
    await fileParser.parseDataFile(file);
    validation.validate(fileParser.mappings.value, fileParser.parsedRecords.value);
    toast.success(`Parsed ${fileParser.parsedRecords.value.length} records`);
    triggerAutoSave();
  } catch (error) {
    console.error('Failed to upload data:', error);
    toast.error('Failed to parse data file');
  }
};

// Search
const filteredMappings = computed(() => {
  if (!searchTerm.value) return fileParser.mappings.value;
  const term = searchTerm.value.toLowerCase();
  return fileParser.mappings.value.filter(m =>
    m.element.toLowerCase().includes(term) ||
    m.value.toLowerCase().includes(term) ||
    m.description.toLowerCase().includes(term)
  );
});

const filteredRecords = computed(() => {
  if (!searchTerm.value) return fileParser.parsedRecords.value;
  const term = searchTerm.value.toLowerCase();
  return fileParser.parsedRecords.value.filter(record =>
    Object.values(record).some(field =>
      field.value.toLowerCase().includes(term) ||
      field.name.toLowerCase().includes(term)
    )
  );
});

const handleSearch = (term: string) => {
  searchTerm.value = term;
};

const handleClearSearch = () => {
  searchTerm.value = '';
};

// Validation
const handleJumpToField = (fieldName: string) => {
  highlightedField.value = fieldName;
  setTimeout(() => {
    highlightedField.value = null;
  }, 3000);
};

// Field handlers
const handleAddField = (field: FieldMapping) => {
  fileParser.mappings.value.push(field);
  fileParser.mappings.value.sort((a, b) => a.positionStart - b.positionStart);
  validation.validate(fileParser.mappings.value, fileParser.parsedRecords.value);
  toast.success(`Added field "${field.element}"`);
  triggerAutoSave();
};

const handleEditField = (field: FieldMapping) => {
  const index = fileParser.mappings.value.findIndex(m => m.element === field.element);
  if (index !== -1) {
    fileParser.mappings.value[index] = field;
    validation.validate(fileParser.mappings.value, fileParser.parsedRecords.value);
    toast.success(`Updated field "${field.element}"`);
    triggerAutoSave();
  }
};

const handleDeleteField = (element: string) => {
  const index = fileParser.mappings.value.findIndex(m => m.element === element);
  if (index !== -1) {
    fileParser.mappings.value.splice(index, 1);
    validation.validate(fileParser.mappings.value, fileParser.parsedRecords.value);
    toast.success(`Deleted field "${element}"`);
    triggerAutoSave();
  }
};

// Export handlers
const handleExportMapperCSV = () => {
  exportTools.exportMapperCSV(fileParser.mappings.value);
  toast.success('Exported mapper to CSV');
};

const handleExportMapperExcel = () => {
  exportTools.exportMapperExcel(fileParser.mappings.value);
  toast.success('Exported mapper to Excel');
};

const handleExportDataCSV = () => {
  exportTools.exportDataCSV(
    fileParser.parsedRecords.value,
    fileParser.mappings.value
  );
  toast.success('Exported data to CSV');
};

const handleExportValidation = () => {
  exportTools.exportValidationReport(
    validation.validationErrors.value,
    fileParser.mappings.value
  );
  toast.success('Exported validation report');
};

const handleExportAll = () => {
  exportTools.exportAll(
    fileParser.mappings.value,
    fileParser.parsedRecords.value,
    validation.validationErrors.value
  );
  toast.success('Exported all files');
};

// Local storage
const triggerAutoSave = storage.setupAutoSave(
  () => fileParser.mappings.value,
  () => fileParser.rawRecords.value,
  () => fileParser.parsedRecords.value
);

const handleRestoreSession = () => {
  const session = storage.loadSession();
  if (session) {
    fileParser.mappings.value = session.mappings;
    fileParser.rawRecords.value = session.rawRecords;
    fileParser.parsedRecords.value = session.parsedRecords;
    validation.validate(session.mappings, session.parsedRecords);
    toast.success('Session restored');
  }
};

const handleClearSession = () => {
  if (confirm('Clear all data and start fresh?')) {
    storage.clearSession();
    fileParser.reset();
    validation.validationErrors.value = [];
    toast.info('Session cleared');
  }
};

// Check for saved session on mount
onMounted(() => {
  if (storage.hasSession.value) {
    const age = storage.getSessionAge();
    if (age !== null && age < 24) {
      if (confirm(`Resume previous session from ${age} hour(s) ago?`)) {
        handleRestoreSession();
      }
    }
  }
});

// Watch for changes to re-validate
watch(
  () => fileParser.mappings.value,
  (newMappings) => {
    validation.validate(newMappings, fileParser.parsedRecords.value);
  },
  { deep: true }
);
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">Fixed-Width Data Mapper</h1>
        <p class="app-subtitle">Validate and edit field mappings for fixed-width data files</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <!-- File Upload Section -->
      <section class="section upload-section">
        <FileUploader
          :loading="fileParser.fileState.value.loading"
          @upload-mapper="handleMapperUpload"
          @upload-data="handleDataUpload"
        />
        <div v-if="fileParser.fileState.value.error" class="error-message">
          {{ fileParser.fileState.value.error }}
        </div>
      </section>

      <!-- Search Section -->
      <section v-if="fileParser.mappings.value.length > 0" class="section search-section">
        <SearchBar
          @search="handleSearch"
          @clear="handleClearSearch"
        />
      </section>

      <!-- Main Grid Layout -->
      <div v-if="fileParser.mappings.value.length > 0" class="main-grid">
        <!-- Mapper Editor -->
        <div class="grid-col mapper-col">
          <MapperEditor
            :mappings="filteredMappings"
            :highlighted-field="highlightedField || undefined"
            @add-field="handleAddField"
            @edit-field="handleEditField"
            @delete-field="handleDeleteField"
            @field-click="handleJumpToField"
          />
        </div>

        <!-- Data Viewer -->
        <div class="grid-col viewer-col">
          <DataViewer
            :records="filteredRecords"
            :mappings="fileParser.mappings.value"
            :current-page="currentPage"
            :records-per-page="recordsPerPage"
            :loading="fileParser.fileState.value.loading"
          />
        </div>

        <!-- Sidebar -->
        <div class="grid-col sidebar-col">
          <!-- Validation Panel -->
          <div class="sidebar-panel">
            <ValidationPanel
              :errors="validation.errors.value"
              :warnings="validation.warnings.value"
              :loading="fileParser.fileState.value.loading"
              @jump-to-field="handleJumpToField"
            />
          </div>

          <!-- Export Panel -->
          <div class="sidebar-panel">
            <ExportPanel
              :disabled="fileParser.mappings.value.length === 0"
              :loading="exportTools.exporting.value"
              @export-mapper-csv="handleExportMapperCSV"
              @export-mapper-excel="handleExportMapperExcel"
              @export-data-csv="handleExportDataCSV"
              @export-validation="handleExportValidation"
              @export-all="handleExportAll"
            />
          </div>

          <!-- Help Panel -->
          <div class="sidebar-panel">
            <HelpPanel />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state-container">
        <div class="empty-state-content">
          <svg class="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">Get Started</h2>
          <p class="text-gray-600 mb-4">Upload your mapper and data files to begin</p>
          <div class="text-sm text-gray-500 space-y-1">
            <p>1. Upload a mapper CSV file (field definitions)</p>
            <p>2. Upload a fixed-width data file</p>
            <p>3. View, validate, and export your data</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p class="text-sm text-gray-600">
        Fixed-Width Data Mapper | Built with Vue 3 + TypeScript
      </p>
    </footer>

    <!-- Toast Notifications -->
    <Toast
      v-for="t in toast.toasts.value"
      :key="t.id"
      :message="t.message"
      :type="t.type"
      :show="t.show"
      @close="toast.removeToast(t.id)"
    />
  </div>
</template>

<style scoped>
.app {
  @apply min-h-screen flex flex-col bg-gray-100;
}

.app-header {
  @apply bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 shadow-lg;
}

.header-content {
  @apply max-w-7xl mx-auto px-4;
}

.app-title {
  @apply text-3xl font-bold mb-1;
}

.app-subtitle {
  @apply text-blue-100;
}

.app-main {
  @apply flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6;
}

.section {
  @apply bg-white rounded-lg shadow-md p-4;
}

.upload-section {
  @apply space-y-4;
}

.search-section {
  @apply p-4;
}

.error-message {
  @apply bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg;
}

.main-grid {
  @apply grid grid-cols-1 lg:grid-cols-12 gap-6;
}

.mapper-col {
  @apply lg:col-span-5;
}

.viewer-col {
  @apply lg:col-span-4;
}

.sidebar-col {
  @apply lg:col-span-3 space-y-6;
}

.grid-col {
  @apply h-[600px];
}

.sidebar-panel {
  @apply h-auto;
}

.empty-state-container {
  @apply flex items-center justify-center py-16;
}

.empty-state-content {
  @apply text-center max-w-md;
}

.app-footer {
  @apply bg-white border-t border-gray-200 py-4 text-center;
}
</style>
