# 09. セキュリティ

## トークン生成のセキュリティ

```javascript
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)  // 暗号学的に安全

  return Array.from(randomValues)
    .map(value => chars[value % chars.length])
    .join('')
}
```

**ポイント:**
- `crypto.getRandomValues()`を使用
- 最低32文字の長さ
- 予測不可能なトークン

## XSS対策

### v-htmlの制限的使用

```vue
<!-- OnceLinkView.vueでのみ使用 -->
<div v-html="content"></div>
```

**リスク**: ユーザー入力HTMLを表示
**許容理由**: ユーザー自身が作成したコンテンツ

**将来的な対策**: DOMPurifyでサニタイズ

```javascript
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(content)
```

## CSRF対策

- Supabaseの認証トークンで自動保護
- すべてのAPI呼び出しにトークン付与
- SameSite Cookieポリシー

## RLSの設計思想

### 最小権限の原則

```sql
-- ユーザーは自分のリンクのみ削除可能
CREATE POLICY "Users can delete own links"
  ON once_links FOR DELETE
  USING (auth.uid() = user_id);
```

### 公開アクセスの制限

```sql
-- アクティブなリンクのみ公開アクセス可能
CREATE POLICY "Anyone can access active links by token"
  ON once_links FOR SELECT
  USING (is_active = true);
```

## 環境変数の安全な管理

### ローカル開発

```bash
# .gitignoreに追加
.env
.env.local
```

### Vercel本番環境

ダッシュボードの「Settings」→「Environment Variables」で設定

## SQLインジェクション対策

Supabaseクライアントは自動的にパラメータをエスケープ:

```javascript
// 安全
.eq('token', userInput)

// 危険（直接SQL）
.rpc('raw_sql', { query: userInput })  // 使用しない
```

## HTTPS強制

- Vercelは自動的にHTTPSを強制
- HTTPSリダイレクトが自動設定

## セキュリティヘッダー

Vercelは以下を自動設定:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## ベストプラクティス

1. **トークンは予測不可能にする**
2. **RLSを必ず有効化する**
3. **環境変数をコミットしない**
4. **ユーザー入力を検証する**
5. **エラーメッセージに機密情報を含めない**
