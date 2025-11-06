# 03. Supabase設定

## 概要

このドキュメントでは、Supabaseプロジェクトの作成からデータベース、認証、RLSの設定まで、完全な手順を説明します。

## 前提条件

- Supabaseアカウント（無料プランで可）
- ブラウザ

## 手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてログイン
2. 「New Project」をクリック
3. 以下を入力:
   - **Name**: `oncelinks`
   - **Database Password**: 強力なパスワードを生成（保存しておく）
   - **Region**: 最寄りのリージョン（例: `Northeast Asia (Tokyo)`）
4. 「Create new project」をクリック

**待機時間**: 約2分

### 2. APIキーの取得

1. 左サイドバーから「Settings」→「API」を選択
2. 以下の値をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...`（長い文字列）

3. `.env.local`に貼り付け:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_APP_URL=http://localhost:5173
```

### 3. データベーステーブルの作成

1. 左サイドバーから「SQL Editor」を選択
2. 「New query」をクリック
3. 以下のSQLを貼り付けて実行:

```sql
-- once_linksテーブルの作成
CREATE TABLE once_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  storage_path TEXT,
  is_active BOOLEAN DEFAULT true,
  accessed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  CONSTRAINT title_length CHECK (char_length(title) <= 200),
  CONSTRAINT token_length CHECK (char_length(token) >= 32)
);

-- インデックスの作成
CREATE INDEX idx_once_links_token ON once_links(token) WHERE is_active = true;
CREATE INDEX idx_once_links_user_id ON once_links(user_id);
CREATE INDEX idx_once_links_created_at ON once_links(created_at DESC);
```

**期待される結果**: `Success. No rows returned`

### 4. Row Level Security (RLS)の設定

同じSQL Editorで以下を実行:

```sql
-- RLSを有効化
ALTER TABLE once_links ENABLE ROW LEVEL SECURITY;

-- ポリシー1: ユーザーは自分のリンクのみ閲覧可能
CREATE POLICY "Users can view own links"
  ON once_links FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー2: ユーザーは自分のリンクのみ作成可能
CREATE POLICY "Users can create own links"
  ON once_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ポリシー3: ユーザーは自分のリンクのみ削除可能
CREATE POLICY "Users can delete own links"
  ON once_links FOR DELETE
  USING (auth.uid() = user_id);

-- ポリシー4: アクティブなリンクは誰でもトークンでアクセス可能
CREATE POLICY "Anyone can access active links by token"
  ON once_links FOR SELECT
  USING (is_active = true);

-- ポリシー5: リンクの無効化は誰でも可能
CREATE POLICY "Anyone can deactivate accessed links"
  ON once_links FOR UPDATE
  USING (is_active = true)
  WITH CHECK (is_active = false AND accessed_at IS NOT NULL);
```

### 5. 認証プロバイダーの設定

#### GitHub OAuth

1. 左サイドバーから「Authentication」→「Providers」を選択
2. 「GitHub」を選択
3. 「Enabled」をオンにする
4. [GitHub Developer Settings](https://github.com/settings/developers)でOAuth Appを作成:
   - **Application name**: `oncelinks`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: Supabaseに表示されているURL
5. **Client ID**と**Client Secret**をSupabaseに貼り付け
6. 「Save」をクリック

#### Google OAuth

1. 「Google」を選択
2. 「Enabled」をオンにする
3. [Google Cloud Console](https://console.cloud.google.com/)でOAuth 2.0クライアントIDを作成
4. **Client ID**と**Client Secret**をSupabaseに貼り付け
5. 「Save」をクリック

#### Email認証

1. 「Email」を選択
2. 「Enabled」がオンになっていることを確認（デフォルトで有効）
3. 「Confirm email」をオフにする（開発時は簡略化）
4. 「Save」をクリック

### 6. リダイレクトURLの設定

1. 「Authentication」→「URL Configuration」を選択
2. 「Redirect URLs」に以下を追加:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/**`
3. 「Save」をクリック

## チェックポイント

以下を確認してください：

- [ ] Supabaseプロジェクトが作成されている
- [ ] `.env.local`に正しいURLとキーが設定されている
- [ ] `once_links`テーブルが作成されている
- [ ] インデックスが作成されている
- [ ] RLSポリシーが5つ設定されている
- [ ] 認証プロバイダー（GitHub, Google, Email）が有効化されている

## データベースの確認

SQL Editorで以下のクエリを実行してテーブル構造を確認:

```sql
SELECT * FROM information_schema.columns
WHERE table_name = 'once_links';
```

RLSポリシーを確認:

```sql
SELECT * FROM pg_policies WHERE tablename = 'once_links';
```

## トラブルシューティング

### エラー: `relation "once_links" does not exist`

**原因:** テーブルが作成されていない

**解決方法:** 手順3のSQLを再実行

### エラー: OAuth認証が失敗する

**原因:** リダイレクトURLが正しく設定されていない

**解決方法:**
1. Supabaseの「Authentication」→「URL Configuration」を確認
2. GitHubまたはGoogleの設定でコールバックURLを確認
3. URLが完全に一致していることを確認

### エラー: RLSポリシーでアクセス拒否

**原因:** ポリシーが正しく設定されていない

**解決方法:** 手順4のSQLを再実行

## 次のステップ

Supabase設定が完了したら：

1. [04. 認証](./04-authentication.md) - 認証フローの実装
2. [05. データベーススキーマ](./05-database-schema.md) - スキーマの詳細理解

## 参考資料

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
