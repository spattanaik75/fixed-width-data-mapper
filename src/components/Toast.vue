<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const visible = ref(props.show);

watch(() => props.show, (newVal) => {
  visible.value = newVal;
  if (newVal && props.duration) {
    setTimeout(() => {
      handleClose();
    }, props.duration);
  }
});

const handleClose = () => {
  visible.value = false;
  emit('close');
};

const iconPath = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
};
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" :class="['toast', `toast-${type || 'info'}`]">
      <div class="toast-content">
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath[type || 'info']" />
        </svg>
        <p class="toast-message">{{ message }}</p>
      </div>
      <button @click="handleClose" class="toast-close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  @apply fixed top-4 right-4 z-50 flex items-center justify-between gap-3 p-4 rounded-lg shadow-lg min-w-[300px] max-w-md;
}

.toast-success {
  @apply bg-green-50 text-green-800 border border-green-200;
}

.toast-error {
  @apply bg-red-50 text-red-800 border border-red-200;
}

.toast-warning {
  @apply bg-yellow-50 text-yellow-800 border border-yellow-200;
}

.toast-info {
  @apply bg-blue-50 text-blue-800 border border-blue-200;
}

.toast-content {
  @apply flex items-center gap-3 flex-1;
}

.toast-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.toast-message {
  @apply text-sm font-medium;
}

.toast-close {
  @apply text-current opacity-70 hover:opacity-100 transition-opacity;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
