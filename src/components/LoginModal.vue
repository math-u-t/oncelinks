<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
        @click.self="close"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 sm:p-8 border border-gray-200 dark:border-gray-700 my-8">
          <!-- ヘッダー -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              ログイン
            </h2>
            <button
              @click="close"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span class="material-icons text-gray-500 dark:text-gray-400">close</span>
            </button>
          </div>

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
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const showEmailAuth = ref(false)
const email = ref('')
const password = ref('')

function close() {
  emit('update:modelValue', false)
  // リセット
  showEmailAuth.value = false
  email.value = ''
  password.value = ''
}

async function signInWithGithub() {
  loading.value = true

  const { error } = await authStore.signInWithProvider('github')

  if (error) {
    toast.error('GitHubログインに失敗しました')
    loading.value = false
    return
  }

  close()
}

async function signInWithGoogle() {
  loading.value = true

  const { error } = await authStore.signInWithProvider('google')

  if (error) {
    toast.error('Googleログインに失敗しました')
    loading.value = false
    return
  }

  close()
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
  close()
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
  close()
  loading.value = false
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}

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
