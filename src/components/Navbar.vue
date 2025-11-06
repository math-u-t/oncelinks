<template>
  <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- ロゴ -->
        <router-link
          to="/"
          class="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <span class="material-icons">link</span>
          <span>oncelinks</span>
        </router-link>

        <!-- デスクトップメニュー -->
        <div class="hidden md:flex items-center gap-4">
          <ThemeToggle />

          <template v-if="isAuthenticated">
            <router-link
              to="/dashboard"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span class="material-icons text-sm">dashboard</span>
              <span>ダッシュボード</span>
            </router-link>

            <button
              @click="handleSignOut"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <span class="material-icons text-sm">logout</span>
              <span>ログアウト</span>
            </button>
          </template>

          <template v-else>
            <router-link
              to="/"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              <span class="material-icons text-sm">login</span>
              <span>ログイン</span>
            </router-link>
          </template>
        </div>

        <!-- モバイルメニューボタン -->
        <div class="md:hidden flex items-center gap-2">
          <ThemeToggle />

          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="メニュー"
          >
            <span class="material-icons text-gray-700 dark:text-gray-300">
              {{ mobileMenuOpen ? 'close' : 'menu' }}
            </span>
          </button>
        </div>
      </div>

      <!-- モバイルメニュー -->
      <Transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col gap-2">
            <template v-if="isAuthenticated">
              <router-link
                to="/dashboard"
                @click="mobileMenuOpen = false"
                class="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span class="material-icons text-sm">dashboard</span>
                <span>ダッシュボード</span>
              </router-link>

              <button
                @click="handleSignOut"
                class="inline-flex items-center gap-2 px-4 py-3 rounded-lg text-left bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <span class="material-icons text-sm">logout</span>
                <span>ログアウト</span>
              </button>
            </template>

            <template v-else>
              <router-link
                to="/"
                @click="mobileMenuOpen = false"
                class="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <span class="material-icons text-sm">login</span>
                <span>ログイン</span>
              </router-link>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import ThemeToggle from './ThemeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const { isAuthenticated } = storeToRefs(authStore)
const mobileMenuOpen = ref(false)

async function handleSignOut() {
  mobileMenuOpen.value = false

  const { error } = await authStore.signOut()

  if (error) {
    toast.error('ログアウトに失敗しました')
    return
  }

  toast.success('ログアウトしました')
  router.push('/')
}
</script>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
