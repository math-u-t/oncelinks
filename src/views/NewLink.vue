<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- ヘッダー -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          新規リンク作成
        </h1>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          一度限りアクセス可能なリンクを作成します
        </p>
      </div>

      <!-- フォーム -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- タイトル -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="title" class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span class="material-icons text-sm">title</span>
                タイトル
              </label>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ title.length }} / 200
              </span>
            </div>

            <input
              id="title"
              v-model="title"
              type="text"
              maxlength="200"
              required
              placeholder="リンクのタイトルを入力"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- HTMLエディタ -->
          <HtmlEditor v-model="htmlContent" />

          <!-- 有効期限 -->
          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <input
                v-model="useExpiration"
                type="checkbox"
                class="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="material-icons text-sm">schedule</span>
              有効期限を設定
            </label>

            <Transition name="fade">
              <div v-if="useExpiration">
                <input
                  v-model="expiresAt"
                  type="datetime-local"
                  :min="minDateTime"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </Transition>
          </div>

          <!-- ボタン -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              :disabled="loading || !isValid"
              class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                     bg-indigo-600 hover:bg-indigo-700 text-white font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
            >
              <span class="material-icons">{{ loading ? 'hourglass_empty' : 'add' }}</span>
              <span>{{ loading ? '作成中...' : 'リンクを作成' }}</span>
            </button>

            <router-link
              to="/dashboard"
              class="px-6 py-3 rounded-lg text-center
                     bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                     text-gray-700 dark:text-gray-300 font-medium
                     transition-colors"
            >
              キャンセル
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLinksStore } from '@/stores/links'
import { useToast } from '@/composables/useToast'
import { validateTitle, validateHtmlContent, validateExpiresAt } from '@/utils/validators'
import HtmlEditor from '@/components/HtmlEditor.vue'

const router = useRouter()
const linksStore = useLinksStore()
const toast = useToast()

const title = ref('')
const htmlContent = ref('')
const useExpiration = ref(false)
const expiresAt = ref('')
const loading = ref(false)

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5) // 最低5分後
  return now.toISOString().slice(0, 16)
})

const isValid = computed(() => {
  if (!title.value || !htmlContent.value) return false

  const titleValidation = validateTitle(title.value)
  const contentValidation = validateHtmlContent(htmlContent.value)

  if (!titleValidation.valid || !contentValidation.valid) return false

  if (useExpiration.value && expiresAt.value) {
    const expirationValidation = validateExpiresAt(expiresAt.value)
    if (!expirationValidation.valid) return false
  }

  return true
})

async function handleSubmit() {
  if (!isValid.value) return

  loading.value = true

  try {
    const linkData = {
      title: title.value.trim(),
      htmlContent: htmlContent.value,
      expiresAt: useExpiration.value && expiresAt.value ? new Date(expiresAt.value).toISOString() : null
    }

    const { data, error } = await linksStore.createLink(linkData)

    if (error) throw error

    // リンクURLをクリップボードにコピー
    const linkUrl = linksStore.getLinkUrl(data.token)
    await navigator.clipboard.writeText(linkUrl)

    toast.success('リンクを作成しました！URLをクリップボードにコピーしました。')

    // ダッシュボードに戻る
    router.push('/dashboard')
  } catch (error) {
    console.error('リンク作成エラー:', error)
    toast.error('リンクの作成に失敗しました: ' + error.message)
  } finally {
    loading.value = false
  }
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
