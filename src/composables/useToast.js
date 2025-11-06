import { ref } from 'vue'

// トースト通知の状態（グローバル）
const toasts = ref([])
let toastId = 0

/**
 * トースト通知のComposable
 */
export function useToast() {
  /**
   * トースト通知を表示
   * @param {string} message - 表示するメッセージ
   * @param {string} type - トーストのタイプ（success, error, warning, info）
   * @param {number} duration - 表示時間（ミリ秒）
   */
  const show = (message, type = 'info', duration = 3000) => {
    const id = ++toastId
    const toast = { id, message, type }

    toasts.value.push(toast)

    // 指定時間後に自動削除
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  /**
   * トーストを削除
   * @param {number} id - 削除するトーストのID
   */
  const remove = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * すべてのトーストをクリア
   */
  const clear = () => {
    toasts.value = []
  }

  // ショートカットメソッド
  const success = (message, duration) => show(message, 'success', duration)
  const error = (message, duration) => show(message, 'error', duration)
  const warning = (message, duration) => show(message, 'warning', duration)
  const info = (message, duration) => show(message, 'info', duration)

  return {
    toasts,
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info
  }
}
