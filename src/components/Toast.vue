<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="toastClasses(toast.type)"
        class="flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm"
      >
        <span class="material-icons flex-shrink-0" :class="iconClasses(toast.type)">
          {{ getIcon(toast.type) }}
        </span>

        <p class="flex-1 text-sm">{{ toast.message }}</p>

        <button
          @click="remove(toast.id)"
          class="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="閉じる"
        >
          <span class="material-icons text-sm">close</span>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

function toastClasses(type) {
  const baseClasses = 'min-w-[300px]'
  const typeClasses = {
    success: 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
    error: 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    info: 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
  }
  return `${baseClasses} ${typeClasses[type] || typeClasses.info}`
}

function iconClasses(type) {
  const typeClasses = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  }
  return typeClasses[type] || typeClasses.info
}

function getIcon(type) {
  const icons = {
    success: 'check_circle',
    error: 'cancel',
    warning: 'warning',
    info: 'info'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
