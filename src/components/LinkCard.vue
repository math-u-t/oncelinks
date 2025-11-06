<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
    <!-- タイトル -->
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 truncate">
      {{ link.title }}
    </h3>

    <!-- 作成日時 -->
    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
      <span class="material-icons text-sm">schedule</span>
      <span>{{ formatDate(link.created_at) }}</span>
    </div>

    <!-- ステータスバッジ -->
    <div class="mb-4">
      <span
        :class="statusBadgeClasses"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      >
        <span class="material-icons text-sm">{{ statusIcon }}</span>
        {{ statusText }}
      </span>
    </div>

    <!-- リンクURL -->
    <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <p class="text-xs font-mono text-gray-600 dark:text-gray-400 truncate">
        {{ linkUrl }}
      </p>
    </div>

    <!-- アクセス日時（使用済みの場合） -->
    <div v-if="link.accessed_at" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
      <span class="material-icons text-sm">visibility</span>
      <span>アクセス: {{ formatDate(link.accessed_at) }}</span>
    </div>

    <!-- 有効期限（設定されている場合） -->
    <div v-if="link.expires_at" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <span class="material-icons text-sm">schedule</span>
      <span>有効期限: {{ formatDate(link.expires_at) }}</span>
    </div>

    <!-- アクションボタン -->
    <div class="flex items-center gap-2">
      <!-- コピーボタン -->
      <button
        @click="copyLink"
        :disabled="!link.is_active"
        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
               bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700
               text-white disabled:text-gray-500
               transition-colors"
        :class="{ 'cursor-not-allowed': !link.is_active }"
      >
        <span class="material-icons text-sm">content_copy</span>
        <span class="text-sm font-medium">コピー</span>
      </button>

      <!-- 編集ボタン（アクティブなリンクのみ） -->
      <button
        v-if="link.is_active"
        @click="handleEdit"
        class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40
               text-blue-600 dark:text-blue-400 transition-colors"
        aria-label="編集"
      >
        <span class="material-icons text-sm">edit</span>
      </button>

      <!-- ゴミ箱ボタン -->
      <button
        @click="handleMoveToTrash"
        class="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40
               text-red-600 dark:text-red-400 transition-colors"
        aria-label="ゴミ箱に移動"
      >
        <span class="material-icons text-sm">delete</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useLinksStore } from '@/stores/links'

const props = defineProps({
  link: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'moveToTrash'])

const router = useRouter()
const toast = useToast()
const linksStore = useLinksStore()

const statusBadgeClasses = computed(() => {
  return props.link.is_active
    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
    : 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
})

const statusIcon = computed(() => {
  return props.link.is_active ? 'check_circle' : 'cancel'
})

const statusText = computed(() => {
  return props.link.is_active ? 'アクティブ' : '使用済み'
})

const linkUrl = computed(() => {
  return linksStore.getLinkUrl(props.link.token)
})

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(linkUrl.value)
    toast.success('リンクをクリップボードにコピーしました')
  } catch (error) {
    console.error('コピーエラー:', error)
    toast.error('リンクのコピーに失敗しました')
  }
}

function handleEdit() {
  router.push(`/edit/${props.link.id}`)
}

function handleMoveToTrash() {
  if (confirm('このリンクをゴミ箱に移動してもよろしいですか？')) {
    emit('moveToTrash', props.link.id)
  }
}

function handleDelete() {
  if (confirm('このリンクを完全に削除してもよろしいですか？この操作は取り消せません。')) {
    emit('delete', props.link.id)
  }
}
</script>
