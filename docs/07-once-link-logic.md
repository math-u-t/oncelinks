# 07. 一度リンクロジック

## 概要

このドキュメントでは、oncelinksの核心機能である「一度限りアクセス可能なリンク」の無効化ロジックを詳細に説明します。

## 基本原理

一度リンクは以下の特性を持ちます：

1. **初回アクセス時に無効化**: リンクにアクセスすると自動的に`is_active`が`false`になる
2. **競合制御**: 複数の同時アクセスがあっても、最初の1つだけが成功する
3. **不可逆性**: 一度無効化されたリンクは二度と有効にできない

## アルゴリズム

### 実装コード（`src/views/OnceLinkView.vue`）

```javascript
async function loadAndDeactivateLink() {
  const token = route.params.token

  try {
    // 1. アクティブなリンクのみ取得
    const link = await linksStore.fetchLinkByToken(token)

    if (!link) {
      throw new Error('リンクが存在しないか、既に無効化されています')
    }

    // 2. 有効期限チェック
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      await linksStore.deactivateLink(link.id)
      throw new Error('このリンクは有効期限切れです')
    }

    // 3. コンテンツを表示
    content.value = link.html_content

    // 4. 即座に無効化（表示と同時に実行）
    await linksStore.deactivateLink(link.id)

  } catch (error) {
    error.value = error.message
  } finally {
    loading.value = false
  }
}
```

### ステップ解説

#### ステップ1: アクティブなリンクの取得

```javascript
const { data, error } = await supabase
  .from('once_links')
  .select('*')
  .eq('token', token)
  .eq('is_active', true)  // 重要: アクティブなもののみ
  .single()
```

**ポイント:**
- `.eq('is_active', true)`により、既に無効化されたリンクは取得できない
- RLSポリシー「Anyone can access active links by token」により、認証なしでアクセス可能

#### ステップ2: 有効期限チェック

```javascript
if (link.expires_at && new Date(link.expires_at) < new Date()) {
  await linksStore.deactivateLink(link.id)
  throw new Error('このリンクは有効期限切れです')
}
```

**ポイント:**
- 有効期限が設定されている場合のみチェック
- 期限切れの場合も無効化する（将来的なアクセスを防ぐ）

#### ステップ3: コンテンツ表示

```javascript
content.value = link.html_content
```

**セキュリティ考慮:**
- `v-html`ディレクティブで表示（XSSリスクあり）
- ユーザー自身が作成したコンテンツなので許容
- 将来的にはDOMPurifyでサニタイズを検討

#### ステップ4: 即座に無効化

```javascript
const { data, error } = await supabase
  .from('once_links')
  .update({
    is_active: false,
    accessed_at: new Date().toISOString(),
    access_count: supabase.sql`access_count + 1`
  })
  .eq('id', id)
  .eq('is_active', true)  // 重要: アクティブなもののみ更新
  .select()
  .single()
```

**ポイント:**
- `.eq('is_active', true)`により、既に無効化されたリンクは更新できない
- これが競合制御の鍵

## 競合制御

### 問題: 同時アクセス

複数のユーザーが同時に同じリンクにアクセスした場合、どうなるか？

### 解決策: RLSポリシー + 条件付きUPDATE

```sql
CREATE POLICY "Anyone can deactivate accessed links"
  ON once_links FOR UPDATE
  USING (is_active = true)
  WITH CHECK (is_active = false AND accessed_at IS NOT NULL);
```

**動作:**

1. **ユーザーA**: リンク取得 → `is_active = true` → 無効化成功
2. **ユーザーB** (同時): リンク取得試行 → `is_active = false`（Aが既に無効化） → 取得失敗

**PostgreSQLのトランザクション分離レベル:**
- SupabaseはデフォルトでRead Committed
- UPDATE文の`.eq('is_active', true)`条件により、行レベルロックが発生
- 最初のUPDATEが完了するまで、他のUPDATEは待機
- 完了後、条件に合わなくなるため、他のUPDATEは0行更新

### タイミング図

```
時刻 | ユーザーA              | ユーザーB
-----|----------------------|----------------------
t0   | SELECT (success)     | SELECT (success)
t1   | UPDATE開始           |
t2   | 行ロック取得          | UPDATE開始（待機）
t3   | is_active=false設定  |
t4   | トランザクション完了  |
t5   |                      | 行ロック取得
t6   |                      | is_active=falseのため条件不一致
t7   |                      | 0行更新（失敗）
```

## エッジケース

### ケース1: ネットワークエラー

**状況:** コンテンツ表示後、無効化前にネットワーク切断

**影響:** リンクは有効なまま、再アクセス可能

**対策:**
- 現在の実装では許容（完全な保証は困難）
- 将来的には、無効化を先に実行する選択肢もある

### ケース2: 有効期限切れリンクへのアクセス

**処理:**
1. 有効期限をチェック
2. 無効化を実行
3. エラーメッセージを表示

**理由:** 将来的なアクセスを防ぐため

### ケース3: ブラウザバック

**状況:** コンテンツ表示後、ブラウザバックで再度アクセス

**動作:** 「リンクが存在しないか、既に無効化されています」エラー

**理由:** 既に`is_active = false`のため、取得できない

## パフォーマンス最適化

### インデックス

```sql
CREATE INDEX idx_once_links_token ON once_links(token) WHERE is_active = true;
```

**効果:**
- トークンによる検索が高速化
- `is_active = true`の部分インデックスにより、サイズ削減
- O(log n)の検索時間

### クエリ最適化

```javascript
// 良い例: 必要なカラムのみ取得
.select('id, title, html_content, expires_at, is_active')

// 悪い例: すべてのカラムを取得
.select('*')
```

## テストシナリオ

### テスト1: 通常のアクセス

1. リンクを作成
2. トークンでアクセス
3. コンテンツが表示される
4. `is_active`が`false`になる
5. 再アクセスでエラー

### テスト2: 同時アクセス

1. リンクを作成
2. 2つのブラウザで同時にアクセス
3. 1つだけ成功、もう1つはエラー

### テスト3: 有効期限切れ

1. 過去の日時で有効期限を設定
2. アクセス
3. 「有効期限切れ」エラー
4. `is_active`が`false`になる

## セキュリティ考慮事項

### 1. トークンの予測不可能性

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

### 2. RLSによるアクセス制御

- ユーザーは自分のリンクのみ削除可能
- 他人のリンクは参照も削除もできない（トークン経由のみ）

### 3. SQLインジェクション対策

- Supabaseクライアントは自動的にパラメータをエスケープ
- 直接SQLを書かない

## まとめ

一度リンクの無効化ロジックは以下の要素で実現されています：

1. **条件付きSELECT**: `is_active = true`でアクティブなリンクのみ取得
2. **条件付きUPDATE**: `is_active = true`のリンクのみ更新
3. **RLSポリシー**: データベースレベルでのアクセス制御
4. **トランザクション分離**: PostgreSQLの行レベルロックによる競合制御

これらが組み合わさることで、安全で信頼性の高い「一度限りリンク」を実現しています。

## 参考資料

- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
