# 04. 認証

## 認証フロー

### OAuth認証（GitHub/Google）

```
1. User clicks "Sign in with GitHub/Google"
2. authStore.signInWithProvider('github'/'google')
3. Supabase redirects to OAuth provider
4. User authorizes the application
5. OAuth provider redirects to callback URL
6. Supabase exchanges code for access token
7. User session created
8. Router navigates to /dashboard
```

### メール認証

```
1. User enters email and password
2. authStore.signInWithEmail(email, password)
3. Supabase Auth API validates credentials
4. Session created
5. Navigate to /dashboard
```

## 実装（stores/auth.js）

```javascript
export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabase()
  const user = ref(null)
  const session = ref(null)

  async function initialize() {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    session.value = currentSession
    user.value = currentSession?.user || null

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user || null
    })
  }

  async function signInWithProvider(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { error }
  }

  return { user, session, initialize, signInWithProvider }
})
```

## 認証ガード（router/index.js）

```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.initialize()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'home' })
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
})
```

## セッション管理

- Supabaseが自動的にトークンをlocalStorageに保存
- `autoRefreshToken: true`で自動更新
- `persistSession: true`でセッション永続化
