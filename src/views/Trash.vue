<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- ヘッダー -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ゴミ箱
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              削除されたリンクを管理します
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

        <!-- 統計情報 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <span class="material-icons text-red-600 dark:text-red-400">delete</span>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">削除済み</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ deletedLinks.length }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ローディング -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <span class="material-icons text-6xl text-indigo-600 dark:text-indigo-400 animate-spin">
          hourglass_empty
        </span>
      </div>

      <!-- リンクがない場合 -->
      <div v-else-if="deletedLinks.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="bg-white dark:bg-gray-800 rounded-full p-8 mb-6 shadow-lg">
          <span class="material-icons text-6xl text-gray-400">
            delete_outline
          </span>
        </div>

        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          ゴミ箱は空です
        </h2>

        <p class="text-gray-600 dark:text-gray-400 mb-8">
          削除されたリンクはここに表示されます
        </p>
      </div>

      <!-- リンク一覧 -->
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="link in deletedLinks"
          :key="link.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
        >
          <!-- ヘッダー -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
              {{ link.title }}
            </h3>

            <div class="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-1">
                <span class="material-icons text-xs">calendar_today</span>
                <span>作成: {{ formatDate(link.created_at) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="material-icons text-xs">delete</span>
                <span>削除: {{ formatDate(link.deleted_at) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="material-icons text-xs">{{ link.is_active ? 'check_circle' : 'cancel' }}</span>
                <span>{{ link.is_active ? 'アクティブ' : '使用済み' }}</span>
              </div>
            </div>
          </div>

          <!-- アクション -->
          <div class="flex gap-2">
            <button
              @click="handleRestore(link.id)"
              :disabled="restoringId === link.id"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                     bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400
                     hover:bg-green-100 dark:hover:bg-green-900/40
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
            >
              <span class="material-icons text-sm">restore</span>
              <span>復元</span>
            </button>

            <button
              @click="handlePermanentDelete(link.id)"
              :disabled="deletingId === link.id"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                     bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                     hover:bg-red-100 dark:hover:bg-red-900/40
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
            >
              <span class="material-icons text-sm">delete_forever</span>
              <span>完全削除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLinksStore } from '@/stores/links'
import { useToast } from '@/composables/useToast'

const linksStore = useLinksStore()
const toast = useToast()

const { deletedLinks, loading } = storeToRefs(linksStore)
const restoringId = ref(null)
const deletingId = ref(null)

onMounted(async () => {
  await linksStore.fetchLinks()
})

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleRestore(linkId) {
  if (!confirm('このリンクを復元しますか？')) return

  restoringId.value = linkId

  try {
    const { error } = await linksStore.restoreFromTrash(linkId)

    if (error) throw error

    toast.success('リンクを復元しました')
  } catch (error) {
    console.error('復元エラー:', error)
    toast.error('リンクの復元に失敗しました: ' + error.message)
  } finally {
    restoringId.value = null
  }
}

async function handlePermanentDelete(linkId) {
  if (!confirm('このリンクを完全に削除しますか？この操作は取り消せません。')) return

  deletingId.value = linkId

  try {
    const { error } = await linksStore.deleteLink(linkId)

    if (error) throw error

    toast.success('リンクを完全に削除しました')
  } catch (error) {
    console.error('削除エラー:', error)
    toast.error('リンクの削除に失敗しました: ' + error.message)
  } finally {
    deletingId.value = null
  }
}
</script>
