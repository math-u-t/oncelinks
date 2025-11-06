<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- ローディング状態 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
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
          アクセスエラー
        </h2>

        <p class="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          {{ error }}
        </p>

        <router-link
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                 bg-indigo-600 hover:bg-indigo-700 text-white
                 transition-colors"
        >
          <span class="material-icons">home</span>
          <span>ホームに戻る</span>
        </router-link>
      </div>

      <!-- コンテンツ表示 -->
      <div v-else-if="content">
        <!-- 警告バナー -->
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div class="flex items-start gap-3">
            <span class="material-icons text-yellow-600 dark:text-yellow-400 flex-shrink-0">
              warning
            </span>
            <div>
              <h3 class="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                このリンクは一度限り有効です
              </h3>
              <p class="text-sm text-yellow-800 dark:text-yellow-200">
                このページを離れると、二度とアクセスできなくなります。必要な情報は今すぐ保存してください。
              </p>
            </div>
          </div>
        </div>

        <!-- HTMLコンテンツ -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <div class="prose prose-lg dark:prose-invert max-w-none" v-html="content"></div>
        </div>

        <!-- フッター -->
        <div class="mt-8 text-center">
          <p class="text-2xl md:text-3xl font-semibold text-gray-600 dark:text-gray-400">
            shared by oncelinks
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLinksStore } from '@/stores/links'

const route = useRoute()
const linksStore = useLinksStore()

const loading = ref(true)
const error = ref(null)
const content = ref(null)

/**
 * 一度リンクの核心ロジック
 * RPC関数を使用してアトミックに取得と無効化を実行
 * これにより、複数の同時アクセスでも確実に1回だけ表示される
 */
onMounted(async () => {
  const token = route.params.token

  if (!token) {
    error.value = 'トークンが指定されていません'
    loading.value = false
    return
  }

  try {
    // RPC関数でアトミックに取得と無効化を実行
    // 有効期限チェック、削除済みチェック、is_activeチェックはRPC内で実行
    const link = await linksStore.fetchAndDeactivateLink(token)

    if (!link) {
      throw new Error('リンクが存在しないか、既に無効化されています')
    }

    // コンテンツを表示
    content.value = link.html_content

  } catch (err) {
    console.error('リンク取得エラー:', err)
    error.value = err.message || 'このリンクは既に使用されたか、存在しません'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ProseスタイリングのカスタマイズはTailwind CSS Typography pluginで可能 */
</style>
