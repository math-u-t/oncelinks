/**
 * バリデーションユーティリティ
 */

/**
 * タイトルのバリデーション
 * @param {string} title - 検証するタイトル
 * @returns {object} - { valid: boolean, error: string }
 */
export function validateTitle(title) {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'タイトルは必須です' }
  }

  if (title.length > 200) {
    return { valid: false, error: 'タイトルは200文字以内で入力してください' }
  }

  return { valid: true, error: null }
}

/**
 * HTMLコンテンツのバリデーション
 * @param {string} content - 検証するHTMLコンテンツ
 * @returns {object} - { valid: boolean, error: string, warning: string }
 */
export function validateHtmlContent(content) {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'HTMLコンテンツは必須です', warning: null }
  }

  const warning = content.length > 50000
    ? 'HTMLコンテンツが50,000文字を超えています。パフォーマンスに影響する可能性があります。'
    : null

  return { valid: true, error: null, warning }
}

/**
 * メールアドレスのバリデーション
 * @param {string} email - 検証するメールアドレス
 * @returns {object} - { valid: boolean, error: string }
 */
export function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'メールアドレスは必須です' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: '有効なメールアドレスを入力してください' }
  }

  return { valid: true, error: null }
}

/**
 * パスワードのバリデーション
 * @param {string} password - 検証するパスワード
 * @returns {object} - { valid: boolean, error: string }
 */
export function validatePassword(password) {
  if (!password || password.length === 0) {
    return { valid: false, error: 'パスワードは必須です' }
  }

  if (password.length < 6) {
    return { valid: false, error: 'パスワードは6文字以上で入力してください' }
  }

  return { valid: true, error: null }
}

/**
 * 有効期限のバリデーション
 * @param {string} expiresAt - 検証する有効期限（ISO文字列）
 * @returns {object} - { valid: boolean, error: string }
 */
export function validateExpiresAt(expiresAt) {
  if (!expiresAt) {
    return { valid: true, error: null } // オプショナル
  }

  const date = new Date(expiresAt)
  const now = new Date()

  if (isNaN(date.getTime())) {
    return { valid: false, error: '有効な日時を入力してください' }
  }

  if (date <= now) {
    return { valid: false, error: '有効期限は現在時刻より後の日時を設定してください' }
  }

  return { valid: true, error: null }
}
