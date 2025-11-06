/**
 * 暗号学的に安全なトークン生成ユーティリティ
 */

/**
 * 指定された長さのランダムなトークンを生成
 * crypto.getRandomValues()を使用して暗号学的に安全
 * @param {number} length - トークンの長さ（デフォルト: 32）
 * @returns {string} - 英数字のランダムトークン
 */
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  return Array.from(randomValues)
    .map(value => chars[value % chars.length])
    .join('')
}

/**
 * UUIDベースのトークンを生成
 * crypto.randomUUID()を使用（より簡潔）
 * @returns {string} - UUIDトークン（ハイフンなし）
 */
export function generateUuidToken() {
  return crypto.randomUUID().replace(/-/g, '')
}

/**
 * デフォルトのトークン生成関数
 * 仕様に従って32文字以上のトークンを生成
 * @returns {string} - 32文字のランダムトークン
 */
export function generateToken() {
  return generateSecureToken(32)
}
