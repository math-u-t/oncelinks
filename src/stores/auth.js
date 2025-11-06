import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabase()

  // State
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')

  /**
   * 認証状態を初期化
   * アプリ起動時に1度だけ実行
   */
  async function initialize() {
    if (initialized.value) return

    try {
      loading.value = true

      // 現在のセッションを取得
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()

      if (error) throw error

      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
      }

      // 認証状態の変更を監視
      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null
      })

      initialized.value = true
    } catch (error) {
      console.error('認証初期化エラー:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * OAuthプロバイダーでサインイン
   * @param {string} provider - プロバイダー名（'github' | 'google'）
   */
  async function signInWithProvider(provider) {
    try {
      loading.value = true

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error(`${provider}サインインエラー:`, error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  /**
   * メールアドレスとパスワードでサインイン
   * @param {string} email - メールアドレス
   * @param {string} password - パスワード
   */
  async function signInWithEmail(email, password) {
    try {
      loading.value = true

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('メールサインインエラー:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  /**
   * メールアドレスとパスワードでサインアップ
   * @param {string} email - メールアドレス
   * @param {string} password - パスワード
   */
  async function signUpWithEmail(email, password) {
    try {
      loading.value = true

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('メールサインアップエラー:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  /**
   * サインアウト
   */
  async function signOut() {
    try {
      loading.value = true

      const { error } = await supabase.auth.signOut()

      if (error) throw error

      user.value = null
      session.value = null

      return { error: null }
    } catch (error) {
      console.error('サインアウトエラー:', error)
      return { error }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    session,
    loading,
    initialized,

    // Getters
    isAuthenticated,
    userEmail,

    // Actions
    initialize,
    signInWithProvider,
    signInWithEmail,
    signUpWithEmail,
    signOut
  }
})
