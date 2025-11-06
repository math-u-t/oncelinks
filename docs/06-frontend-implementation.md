# 06. フロントエンド実装

## Vue 3 Composition API

### 基本パターン

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

## Piniaストアの使用

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

async function handleSignOut() {
  await authStore.signOut()
}
</script>
```

## Composableの作成

```javascript
// composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  const show = (message, type = 'info') => {
    toasts.value.push({ id: Date.now(), message, type })
  }

  return { toasts, show }
}
```

## コンポーネント設計原則

### Props/Emits

```vue
<script setup>
const props = defineProps({
  link: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])

function handleDelete() {
  emit('delete', props.link.id)
}
</script>
```

### コンポーネント命名規則

- **PascalCase**: `LinkCard.vue`
- **ファイル名**: kebab-case（ルーティング）
- **変数名**: camelCase

## Tailwind CSS

### ダークモード

```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

### レスポンシブ

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

## Material Icons使用方法

```html
<span class="material-icons text-indigo-600">link</span>
<span class="material-icons text-sm">add</span>
<span class="material-icons animate-spin">refresh</span>
```
