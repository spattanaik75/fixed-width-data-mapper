<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  loading?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  uploadMapper: [file: File];
  uploadData: [file: File];
}>();

const mapperInput = ref<HTMLInputElement | null>(null);
const dataInput = ref<HTMLInputElement | null>(null);
const mapperDragging = ref(false);
const dataDragging = ref(false);
const mapperFileName = ref<string | null>(null);
const dataFileName = ref<string | null>(null);

const handleMapperClick = () => {
  mapperInput.value?.click();
};

const handleDataClick = () => {
  dataInput.value?.click();
};

const handleMapperChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    mapperFileName.value = file.name;
    emit('uploadMapper', file);
  }
};

const handleDataChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    dataFileName.value = file.name;
    emit('uploadData', file);
  }
};

const handleMapperDrop = (e: DragEvent) => {
  mapperDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) {
    mapperFileName.value = file.name;
    emit('uploadMapper', file);
  }
};

const handleDataDrop = (e: DragEvent) => {
  dataDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) {
    dataFileName.value = file.name;
    emit('uploadData', file);
  }
};
</script>

<template>
  <div class="file-uploader">
    <div class="flex gap-4 mb-4">
      <!-- Mapper File Upload -->
      <div class="flex-1">
        <label class="block text-sm font-medium mb-2 text-gray-700">
          Mapper File (CSV or Excel)
        </label>
        <div
          class="upload-zone"
          :class="{
            'dragging': mapperDragging,
            'disabled': disabled || loading
          }"
          @click="handleMapperClick"
          @dragover.prevent="mapperDragging = true"
          @dragleave="mapperDragging = false"
          @drop.prevent="handleMapperDrop"
        >
          <input
            ref="mapperInput"
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            class="hidden"
            @change="handleMapperChange"
            :disabled="disabled || loading"
          />
          <div class="upload-content">
            <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p v-if="!mapperFileName" class="text-sm text-gray-600">
              Drop mapper file here or click to browse
            </p>
            <p v-else class="text-sm text-blue-600 font-medium">
              {{ mapperFileName }}
            </p>
            <p class="text-xs text-gray-500 mt-1">CSV or Excel</p>
          </div>
        </div>
      </div>

      <!-- Data File Upload -->
      <div class="flex-1">
        <label class="block text-sm font-medium mb-2 text-gray-700">
          Data File (Fixed-Width)
        </label>
        <div
          class="upload-zone"
          :class="{
            'dragging': dataDragging,
            'disabled': disabled || loading
          }"
          @click="handleDataClick"
          @dragover.prevent="dataDragging = true"
          @dragleave="dataDragging = false"
          @drop.prevent="handleDataDrop"
        >
          <input
            ref="dataInput"
            type="file"
            class="hidden"
            @change="handleDataChange"
            :disabled="disabled || loading"
          />
          <div class="upload-content">
            <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p v-if="!dataFileName" class="text-sm text-gray-600">
              Drop data file here or click to browse
            </p>
            <p v-else class="text-sm text-blue-600 font-medium">
              {{ dataFileName }}
            </p>
            <p class="text-xs text-gray-500 mt-1">Fixed-width format, max 5MB</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer transition-all;
  @apply hover:border-blue-500 hover:bg-blue-50;
}

.upload-zone.dragging {
  @apply border-blue-500 bg-blue-50;
}

.upload-zone.disabled {
  @apply opacity-50 cursor-not-allowed;
}

.upload-content {
  @apply text-center pointer-events-none;
}
</style>
