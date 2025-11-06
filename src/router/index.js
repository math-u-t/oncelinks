import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/new',
    name: 'new-link',
    component: () => import('@/views/NewLink.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'edit-link',
    component: () => import('@/views/EditLink.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trash',
    name: 'trash',
    component: () => import('@/views/Trash.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/link/:token',
    name: 'once-link',
    component: () => import('@/views/OnceLinkView.vue'),
    meta: { public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * ナビゲーションガード
 * 認証状態に基づいてリダイレクト
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 認証ストアの初期化を待つ
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const isAuthenticated = authStore.isAuthenticated

  // 認証が必要なページ
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // ゲスト専用ページ（ログイン済みユーザーはダッシュボードへ）
  if (requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
