<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- ヘッダー -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ダッシュボード
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            作成したリンクを管理
          </p>
        </div>

        <div class="flex gap-3">
          <router-link
            to="/trash"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                   text-gray-700 dark:text-gray-300
                   transition-colors"
          >
            <span class="material-icons text-sm">delete</span>
            <span>ゴミ箱</span>
          </router-link>

          <router-link
            to="/settings"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                   text-gray-700 dark:text-gray-300
                   transition-colors"
          >
            <span class="material-icons text-sm">settings</span>
            <span>設定</span>
          </router-link>

          <router-link
            to="/new"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                   bg-indigo-600 hover:bg-indigo-700 text-white
                   transition-colors shadow-md hover:shadow-lg"
          >
            <span class="material-icons">add</span>
            <span class="font-medium">新規リンク作成</span>
          </router-link>
        </div>
      </div>

      <!-- ローディング状態 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <span class="material-icons text-6xl text-indigo-600 dark:text-indigo-400 animate-spin mb-4">
          refresh
        </span>
        <p class="text-gray-600 dark:text-gray-400">リンクを読み込んでいます...</p>
      </div>

      <!-- 空状態 -->
      <div v-else-if="links.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="bg-white dark:bg-gray-800 rounded-full p-8 mb-6 shadow-lg">
          <span class="material-icons text-6xl text-gray-400 dark:text-gray-600">
            link_off
          </span>
        </div>

        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          リンクがありません
        </h2>

        <p class="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          まだリンクが作成されていません。<br />最初のリンクを作成してみましょう！
        </p>

        <router-link
          to="/new"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                 bg-indigo-600 hover:bg-indigo-700 text-white
                 transition-colors"
        >
          <span class="material-icons">add</span>
          <span>最初のリンクを作成</span>
        </router-link>
      </div>

      <!-- 統計情報 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
              <span class="material-icons text-indigo-600 dark:text-indigo-400">link</span>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">総リンク数</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ linkCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <span class="material-icons text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">アクティブ</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeLinks.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
              <span class="material-icons text-gray-600 dark:text-gray-400">cancel</span>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">使用済み</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ inactiveLinks.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- リンク一覧 -->
      <div v-if="links.length > 0">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LinkCard
            v-for="link in links"
            :key="link.id"
            :link="link"
            @delete="handleDelete"
            @moveToTrash="handleMoveToTrash"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLinksStore } from '@/stores/links'
import { useToast } from '@/composables/useToast'
import LinkCard from '@/components/LinkCard.vue'

const linksStore = useLinksStore()
const toast = useToast()

const { links, loading, activeLinks, inactiveLinks, linkCount } = storeToRefs(linksStore)

onMounted(async () => {
  const { error } = await linksStore.fetchLinks()

  if (error) {
    toast.error('リンクの取得に失敗しました')
  }
})

async function handleMoveToTrash(linkId) {
  const { error } = await linksStore.moveToTrash(linkId)

  if (error) {
    toast.error('リンクの削除に失敗しました')
    return
  }

  toast.success('リンクをゴミ箱に移動しました')
}

async function handleDelete(linkId) {
  const { error } = await linksStore.deleteLink(linkId)

  if (error) {
    toast.error('リンクの削除に失敗しました')
    return
  }

  toast.success('リンクを完全に削除しました')
}
</script>
