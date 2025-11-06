import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const THEME_STORAGE_KEY = 'oncelinks-theme'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDark = ref(false)

  // Getters
  const theme = computed(() => isDark.value ? 'dark' : 'light')

  /**
   * テーマを初期化
   * localStorage -> システム設定 の優先順位で初期テーマを決定
   */
  function initialize() {
    // localStorageから読み込み
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (storedTheme) {
      isDark.value = storedTheme === 'dark'
    } else {
      // システムのダークモード設定を検出
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // テーマを適用
    applyTheme()

    // システム設定の変更を監視
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // ユーザーが手動で設定していない場合のみシステム設定に従う
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        isDark.value = e.matches
      }
    })
  }

  /**
   * テーマを切り替え
   */
  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem(THEME_STORAGE_KEY, theme.value)
    applyTheme()
  }

  /**
   * テーマを設定
   * @param {string} newTheme - 'dark' | 'light'
   */
  function setTheme(newTheme) {
    isDark.value = newTheme === 'dark'
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyTheme()
  }

  /**
   * テーマをDOMに適用
   */
  function applyTheme() {
    const html = document.documentElement

    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // テーマ変更を監視
  watch(isDark, () => {
    applyTheme()
  })

  return {
    // State
    isDark,

    // Getters
    theme,

    // Actions
    initialize,
    toggle,
    setTheme,
    applyTheme
  }
})
