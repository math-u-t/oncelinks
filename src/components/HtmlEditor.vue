<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label :for="inputId" class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <span class="material-icons text-sm">code</span>
        HTMLコンテンツ
      </label>

      <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span class="material-icons text-xs">info</span>
        {{ characterCount }} 文字
      </div>
    </div>

    <textarea
      :id="inputId"
      :value="modelValue"
      @input="handleInput"
      class="w-full min-h-[300px] p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg
             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
             placeholder-gray-400 dark:placeholder-gray-500
             resize-y"
      :placeholder="placeholder"
      rows="15"
    ></textarea>

    <div v-if="showWarning" class="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <span class="material-icons text-yellow-600 dark:text-yellow-400 text-sm flex-shrink-0">warning</span>
      <p class="text-sm text-yellow-800 dark:text-yellow-200">
        HTMLコンテンツが50,000文字を超えています。パフォーマンスに影響する可能性があります。
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'HTMLコンテンツを入力してください...'
  },
  inputId: {
    type: String,
    default: 'html-editor'
  }
})

const emit = defineEmits(['update:modelValue'])

const characterCount = computed(() => props.modelValue?.length || 0)
const showWarning = computed(() => characterCount.value > 50000)

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>
