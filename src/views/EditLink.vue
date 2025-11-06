<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- ローディング状態 -->
      <div v-if="initialLoading" class="flex flex-col items-center justify-center py-20">
        <span class="material-icons text-6xl text-indigo-600 dark:text-indigo-400 animate-spin mb-4">
          hourglass_empty
        </span>
        <p class="text-gray-600 dark:text-gray-400">リンクを読み込んでいます...</p>
      </div>

      <!-- エラー状態 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <div class="bg-white dark:bg-gray-800 rounded-full p-8 mb-6 shadow-lg">
          <span class="material-icons text-6xl text-red-500 dark:text-red-400">
            cancel
          </span>
        </div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          エラー
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          {{ error }}
        </p>
        <router-link
          to="/dashboard"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                 bg-indigo-600 hover:bg-indigo-700 text-white
                 transition-colors"
        >
          <span class="material-icons">dashboard</span>
          <span>ダッシュボードに戻る</span>
        </router-link>
      </div>

      <!-- 編集フォーム -->
      <div v-else>
        <!-- ヘッダー -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            リンクを編集
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            リンクの内容を編集します（アクティブなリンクのみ編集可能）
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
                <span class="material-icons">{{ loading ? 'hourglass_empty' : 'save' }}</span>
                <span>{{ loading ? '保存中...' : '変更を保存' }}</span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLinksStore } from '@/stores/links'
import { useToast } from '@/composables/useToast'
import { validateTitle, validateHtmlContent, validateExpiresAt } from '@/utils/validators'
import HtmlEditor from '@/components/HtmlEditor.vue'

const router = useRouter()
const route = useRoute()
const linksStore = useLinksStore()
const toast = useToast()

const linkId = route.params.id
const title = ref('')
const htmlContent = ref('')
const useExpiration = ref(false)
const expiresAt = ref('')
const loading = ref(false)
const initialLoading = ref(true)
const error = ref(null)

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

// リンクデータを読み込み
onMounted(async () => {
  try {
    // リンク一覧を取得（まだ取得していない場合）
    if (linksStore.links.length === 0) {
      await linksStore.fetchLinks()
    }

    // 該当するリンクを検索
    const link = linksStore.links.find(l => l.id === linkId)

    if (!link) {
      throw new Error('リンクが見つかりません')
    }

    // アクティブでないリンクは編集不可
    if (!link.is_active) {
      throw new Error('このリンクは既に使用されているため編集できません')
    }

    // 削除済みリンクは編集不可
    if (link.deleted_at) {
      throw new Error('削除されたリンクは編集できません')
    }

    // フォームに値をセット
    title.value = link.title
    htmlContent.value = link.html_content

    if (link.expires_at) {
      useExpiration.value = true
      // ISO文字列をdatetime-local形式に変換
      expiresAt.value = new Date(link.expires_at).toISOString().slice(0, 16)
    }

  } catch (err) {
    console.error('リンク読み込みエラー:', err)
    error.value = err.message || 'リンクの読み込みに失敗しました'
  } finally {
    initialLoading.value = false
  }
})

async function handleSubmit() {
  if (!isValid.value) return

  loading.value = true

  try {
    const updateData = {
      title: title.value.trim(),
      htmlContent: htmlContent.value,
      expiresAt: useExpiration.value && expiresAt.value ? new Date(expiresAt.value).toISOString() : null
    }

    const { error: updateError } = await linksStore.updateLink(linkId, updateData)

    if (updateError) throw updateError

    toast.success('リンクを更新しました')

    // ダッシュボードに戻る
    router.push('/dashboard')
  } catch (error) {
    console.error('リンク更新エラー:', error)
    toast.error('リンクの更新に失敗しました: ' + error.message)
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
