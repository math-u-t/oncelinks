<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- ヘッダー -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              設定
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              アカウント情報を管理します
            </p>
          </div>

          <router-link
            to="/dashboard"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                   text-gray-700 dark:text-gray-300
                   transition-colors"
          >
            <span class="material-icons text-sm">arrow_back</span>
            <span>ダッシュボードに戻る</span>
          </router-link>
        </div>
      </div>

      <!-- アカウント情報 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span class="material-icons">account_circle</span>
          アカウント情報
        </h2>

        <div class="space-y-4">
          <!-- メールアドレス -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              メールアドレス
            </label>
            <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
              {{ authStore.userEmail || '未設定' }}
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              メールアドレスの変更はSupabaseダッシュボードから行ってください
            </p>
          </div>

          <!-- ユーザーID -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ユーザーID
            </label>
            <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm">
              {{ authStore.user?.id || '未設定' }}
            </div>
          </div>

          <!-- ログイン方法 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              認証プロバイダー
            </label>
            <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
              {{ getAuthProvider() }}
            </div>
          </div>
        </div>
      </div>

      <!-- パスワード変更 -->
      <div
        v-if="isEmailAuth"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6"
      >
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span class="material-icons">lock</span>
          パスワード変更
        </h2>

        <form @submit.prevent="handlePasswordChange" class="space-y-4">
          <!-- 新しいパスワード -->
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              新しいパスワード
            </label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              placeholder="新しいパスワード"
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              6文字以上で設定してください
            </p>
          </div>

          <!-- パスワード確認 -->
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              パスワード確認
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              placeholder="パスワードを再入力"
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- エラーメッセージ -->
          <div v-if="passwordError" class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <span class="material-icons text-red-600 dark:text-red-400 text-sm">error</span>
            <p class="text-sm text-red-800 dark:text-red-200">{{ passwordError }}</p>
          </div>

          <!-- ボタン -->
          <button
            type="submit"
            :disabled="passwordLoading || !newPassword || !confirmPassword"
            class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                   bg-indigo-600 hover:bg-indigo-700 text-white font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
          >
            <span class="material-icons">{{ passwordLoading ? 'hourglass_empty' : 'save' }}</span>
            <span>{{ passwordLoading ? '変更中...' : 'パスワードを変更' }}</span>
          </button>
        </form>
      </div>

      <!-- OAuth認証の場合のメッセージ -->
      <div
        v-else
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
      >
        <div class="flex items-start gap-3">
          <span class="material-icons text-blue-600 dark:text-blue-400">info</span>
          <div>
            <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              OAuth認証をご利用中です
            </h3>
            <p class="text-sm text-blue-800 dark:text-blue-200">
              GitHubまたはGoogleでログインしているため、パスワードの変更はできません。
              パスワードの管理は各サービスで行ってください。
            </p>
          </div>
        </div>
      </div>

      <!-- アカウント削除 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800 p-6 md:p-8 mt-6">
        <h2 class="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <span class="material-icons">warning</span>
          危険な操作
        </h2>

        <p class="text-gray-600 dark:text-gray-400 mb-4">
          アカウントを削除すると、すべてのリンクとデータが完全に削除されます。この操作は取り消せません。
        </p>

        <button
          @click="handleDeleteAccount"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                 bg-red-600 hover:bg-red-700 text-white font-medium
                 transition-colors"
        >
          <span class="material-icons">delete_forever</span>
          <span>アカウントを削除</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const supabase = useSupabase()

const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')

// メール認証かどうかを判定
const isEmailAuth = computed(() => {
  const identities = authStore.user?.identities || []
  return identities.length === 0 || identities.some(identity => identity.provider === 'email')
})

function getAuthProvider() {
  const identities = authStore.user?.identities || []
  if (identities.length === 0) return 'Email'

  const providers = identities.map(identity => {
    switch (identity.provider) {
      case 'github': return 'GitHub'
      case 'google': return 'Google'
      case 'email': return 'Email'
      default: return identity.provider
    }
  })

  return providers.join(', ')
}

async function handlePasswordChange() {
  passwordError.value = ''

  // バリデーション
  if (newPassword.value.length < 6) {
    passwordError.value = 'パスワードは6文字以上で設定してください'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'パスワードが一致しません'
    return
  }

  passwordLoading.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })

    if (error) throw error

    toast.success('パスワードを変更しました')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('パスワード変更エラー:', error)
    passwordError.value = error.message || 'パスワードの変更に失敗しました'
  } finally {
    passwordLoading.value = false
  }
}

async function handleDeleteAccount() {
  const confirmation = prompt(
    'アカウントを削除するには、メールアドレスを入力してください:\n' +
    authStore.userEmail
  )

  if (confirmation !== authStore.userEmail) {
    if (confirmation !== null) {
      toast.error('メールアドレスが一致しません')
    }
    return
  }

  if (!confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
    return
  }

  try {
    // Note: Supabase Authでは、ユーザー自身がアカウントを削除する機能は
    // デフォルトでは提供されていません。管理者APIを使用する必要があります。
    // ここでは、実装のプレースホルダーとして警告を表示します。

    toast.error('アカウント削除機能は現在実装中です。サポートにお問い合わせください。')

    // 実際の実装では、バックエンドのエンドポイントを呼び出す必要があります
    // const { error } = await fetch('/api/delete-account', { method: 'DELETE' })

  } catch (error) {
    console.error('アカウント削除エラー:', error)
    toast.error('アカウントの削除に失敗しました')
  }
}
</script>
