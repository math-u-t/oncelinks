<template>
  <div id="app">
    <Navbar />
    <router-view />
    <Toast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import Navbar from './components/Navbar.vue'
import Toast from './components/Toast.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(() => {
  // 認証状態を初期化
  authStore.initialize()

  // テーマを初期化
  themeStore.initialize()
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
