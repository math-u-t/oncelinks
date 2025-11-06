import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from './auth'
import { generateToken } from '@/utils/tokenGenerator'

export const useLinksStore = defineStore('links', () => {
  const supabase = useSupabase()
  const authStore = useAuthStore()

  // State
  const links = ref([])
  const loading = ref(false)
  const currentLink = ref(null)

  // Getters
  const activeLinks = computed(() =>
    links.value.filter(link => link.is_active && !link.deleted_at)
  )

  const inactiveLinks = computed(() =>
    links.value.filter(link => !link.is_active && !link.deleted_at)
  )

  const deletedLinks = computed(() =>
    links.value.filter(link => link.deleted_at)
  )

  const linkCount = computed(() => links.value.filter(link => !link.deleted_at).length)

  /**
   * ユーザーのリンク一覧を取得
   */
  async function fetchLinks() {
    if (!authStore.user) {
      console.warn('ユーザーが認証されていません')
      return { data: [], error: new Error('Not authenticated') }
    }

    try {
      loading.value = true

      const { data, error } = await supabase
        .from('once_links')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      links.value = data || []
      return { data, error: null }
    } catch (error) {
      console.error('リンク取得エラー:', error)
      return { data: [], error }
    } finally {
      loading.value = false
    }
  }

  /**
   * トークンでリンクを取得して即座に無効化（一度きりアクセス用）
   * アトミックな操作のためRPC関数を使用
   * @param {string} token - リンクトークン
   */
  async function fetchAndDeactivateLink(token) {
    try {
      loading.value = true

      const { data, error } = await supabase
        .rpc('fetch_and_deactivate_link', { link_token: token })

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('このリンクは既に使用されたか、存在しません')
      }

      currentLink.value = data[0]
      return data[0]
    } catch (error) {
      console.error('リンク取得・無効化エラー:', error)
      currentLink.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * トークンでリンクを取得（公開アクセス用・無効化しない）
   * @param {string} token - リンクトークン
   */
  async function fetchLinkByToken(token) {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from('once_links')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single()

      if (error) throw error

      currentLink.value = data
      return data
    } catch (error) {
      console.error('トークンでリンク取得エラー:', error)
      currentLink.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 新規リンクを作成
   * @param {object} linkData - { title, htmlContent, expiresAt }
   */
  async function createLink({ title, htmlContent, expiresAt = null }) {
    if (!authStore.user) {
      throw new Error('認証が必要です')
    }

    try {
      loading.value = true

      const token = generateToken()
      const linkData = {
        user_id: authStore.user.id,
        token,
        title,
        html_content: htmlContent,
        expires_at: expiresAt,
        is_active: true,
        access_count: 0
      }

      const { data, error } = await supabase
        .from('once_links')
        .insert([linkData])
        .select()
        .single()

      if (error) throw error

      // ローカルのリンク一覧に追加
      links.value.unshift(data)

      return { data, error: null }
    } catch (error) {
      console.error('リンク作成エラー:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  /**
   * リンクを無効化（一度リンクアクセス時）
   * @param {string} id - リンクID
   */
  async function deactivateLink(id) {
    try {
      const { data, error } = await supabase
        .from('once_links')
        .update({
          is_active: false,
          accessed_at: new Date().toISOString(),
          access_count: supabase.sql`access_count + 1`
        })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) throw error

      // ローカルの状態を更新
      const index = links.value.findIndex(link => link.id === id)
      if (index > -1) {
        links.value[index] = data
      }

      if (currentLink.value?.id === id) {
        currentLink.value = data
      }

      return { data, error: null }
    } catch (error) {
      console.error('リンク無効化エラー:', error)
      return { data: null, error }
    }
  }

  /**
   * リンクを編集
   * @param {string} id - リンクID
   * @param {object} updates - { title, htmlContent, expiresAt }
   */
  async function updateLink(id, { title, htmlContent, expiresAt }) {
    if (!authStore.user) {
      throw new Error('認証が必要です')
    }

    try {
      loading.value = true

      const updateData = {
        title,
        html_content: htmlContent,
        expires_at: expiresAt
      }

      const { data, error } = await supabase
        .from('once_links')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()
        .single()

      if (error) throw error

      // ローカルの状態を更新
      const index = links.value.findIndex(link => link.id === id)
      if (index > -1) {
        links.value[index] = data
      }

      return { data, error: null }
    } catch (error) {
      console.error('リンク更新エラー:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  /**
   * リンクをゴミ箱に移動（論理削除）
   * @param {string} id - リンクID
   */
  async function moveToTrash(id) {
    if (!authStore.user) {
      throw new Error('認証が必要です')
    }

    try {
      loading.value = true

      const { data, error } = await supabase
        .from('once_links')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()
        .single()

      if (error) throw error

      // ローカルの状態を更新
      const index = links.value.findIndex(link => link.id === id)
      if (index > -1) {
        links.value[index] = data
      }

      return { data, error: null }
    } catch (error) {
      console.error('ゴミ箱移動エラー:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  /**
   * リンクをゴミ箱から復元
   * @param {string} id - リンクID
   */
  async function restoreFromTrash(id) {
    if (!authStore.user) {
      throw new Error('認証が必要です')
    }

    try {
      loading.value = true

      const { data, error } = await supabase
        .from('once_links')
        .update({ deleted_at: null })
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()
        .single()

      if (error) throw error

      // ローカルの状態を更新
      const index = links.value.findIndex(link => link.id === id)
      if (index > -1) {
        links.value[index] = data
      }

      return { data, error: null }
    } catch (error) {
      console.error('復元エラー:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  /**
   * リンクを完全に削除（物理削除）
   * @param {string} id - リンクID
   */
  async function deleteLink(id) {
    if (!authStore.user) {
      throw new Error('認証が必要です')
    }

    try {
      loading.value = true

      const { error } = await supabase
        .from('once_links')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user.id)

      if (error) throw error

      // ローカルの状態から削除
      const index = links.value.findIndex(link => link.id === id)
      if (index > -1) {
        links.value.splice(index, 1)
      }

      return { error: null }
    } catch (error) {
      console.error('リンク削除エラー:', error)
      return { error }
    } finally {
      loading.value = false
    }
  }

  /**
   * リンクのURLを生成
   * @param {string} token - リンクトークン
   */
  function getLinkUrl(token) {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
    return `${appUrl}/link/${token}`
  }

  /**
   * ストアをクリア
   */
  function clearLinks() {
    links.value = []
    currentLink.value = null
  }

  return {
    // State
    links,
    loading,
    currentLink,

    // Getters
    activeLinks,
    inactiveLinks,
    deletedLinks,
    linkCount,

    // Actions
    fetchLinks,
    fetchLinkByToken,
    fetchAndDeactivateLink,
    createLink,
    updateLink,
    deactivateLink,
    moveToTrash,
    restoreFromTrash,
    deleteLink,
    getLinkUrl,
    clearLinks
  }
})
