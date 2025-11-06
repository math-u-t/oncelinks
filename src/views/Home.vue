<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
    <!-- ヒーローセクション -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <div class="flex items-center justify-center gap-3 mb-6">
          <span class="material-icons text-6xl text-indigo-600 dark:text-indigo-400">link</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          oncelinks
        </h1>

        <p class="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
          一度限りアクセス可能なリンクを生成
        </p>

        <p class="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4">
          セキュアにHTMLコンテンツを共有。リンクは一度アクセスされると自動的に無効化されます。
        </p>
      </div>

      <!-- 主要機能カード -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <span class="material-icons text-3xl text-indigo-600 dark:text-indigo-400">security</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            セキュア
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            暗号学的に安全なトークンで生成。一度だけアクセス可能。
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <span class="material-icons text-3xl text-green-600 dark:text-green-400">speed</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            シンプル
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            直感的なUI。数クリックでリンクを作成・共有。
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <span class="material-icons text-3xl text-purple-600 dark:text-purple-400">dashboard</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            管理
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            ダッシュボードで全リンクを一元管理。ステータス確認。
          </p>
        </div>
      </div>

      <!-- 認証セクション -->
      <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          始めましょう
        </h2>

        <!-- OAuth認証ボタン -->
        <div class="space-y-3 mb-6">
          <button
            @click="signInWithGithub"
            :disabled="loading"
            class="w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-lg
                   bg-gray-900 hover:bg-gray-800 text-white
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
          >
            <span class="material-icons">login</span>
            <span>GitHubでログイン</span>
          </button>

          <button
            @click="signInWithGoogle"
            :disabled="loading"
            class="w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-lg
                   bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                   text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
          >
            <span class="material-icons">login</span>
            <span>Googleでログイン</span>
          </button>
        </div>

        <!-- メール認証切り替え -->
        <div class="text-center mb-4">
          <button
            @click="showEmailAuth = !showEmailAuth"
            class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {{ showEmailAuth ? 'OAuth認証に戻る' : 'メールアドレスでログイン' }}
          </button>
        </div>

        <!-- メール認証フォーム -->
        <Transition name="fade">
          <div v-if="showEmailAuth" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                パスワード
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div class="flex gap-2">
              <button
                @click="signInWithEmailPassword"
                :disabled="loading || !email || !password"
                class="flex-1 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700
                       text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ログイン
              </button>

              <button
                @click="signUpWithEmailPassword"
                :disabled="loading || !email || !password"
                class="flex-1 px-6 py-2 rounded-lg bg-white dark:bg-gray-700
                       text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400
                       hover:bg-indigo-50 dark:hover:bg-gray-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                新規登録
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const showEmailAuth = ref(false)
const email = ref('')
const password = ref('')

async function signInWithGithub() {
  loading.value = true

  const { error } = await authStore.signInWithProvider('github')

  if (error) {
    toast.error('GitHubログインに失敗しました')
    loading.value = false
    return
  }

  // OAuth認証はリダイレクトされるため、ここでは何もしない
}

async function signInWithGoogle() {
  loading.value = true

  const { error } = await authStore.signInWithProvider('google')

  if (error) {
    toast.error('Googleログインに失敗しました')
    loading.value = false
    return
  }

  // OAuth認証はリダイレクトされるため、ここでは何もしない
}

async function signInWithEmailPassword() {
  loading.value = true

  const { error } = await authStore.signInWithEmail(email.value, password.value)

  if (error) {
    toast.error('ログインに失敗しました: ' + error.message)
    loading.value = false
    return
  }

  toast.success('ログインしました')
  router.push('/dashboard')
  loading.value = false
}

async function signUpWithEmailPassword() {
  loading.value = true

  const { error } = await authStore.signUpWithEmail(email.value, password.value)

  if (error) {
    toast.error('登録に失敗しました: ' + error.message)
    loading.value = false
    return
  }

  toast.success('登録しました。確認メールをご確認ください。')
  loading.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
