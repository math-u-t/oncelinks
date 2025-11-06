<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    :aria-label="isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'"
  >
    <span class="material-icons text-gray-700 dark:text-gray-300">
      {{ isDark ? 'light_mode' : 'dark_mode' }}
    </span>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

function toggleTheme() {
  themeStore.toggle()
}
</script>
