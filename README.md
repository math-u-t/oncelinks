# oncelinks

**一度限りアクセス可能なリンク生成Webアプリケーション**

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)

## 概要

**oncelinks**は、HTMLコンテンツを含む一度限りアクセス可能なリンクを生成・管理するWebアプリケーションです。

### 主要機能

- **一度限りリンク**: リンクにアクセスすると自動的に無効化
- **セキュア**: 暗号学的に安全なトークン生成
- **認証**: GitHub, Google, Email認証対応
- **ダークモード**: システム設定に応じた自動切り替え
- **レスポンシブ**: モバイル、タブレット、デスクトップ対応

## デモ

（デプロイ後にURLを追加）

## スクリーンショット

（スクリーンショットを追加予定）

## 技術スタック

- **フロントエンド**: Vue 3 (Composition API) + Vite
- **スタイリング**: Tailwind CSS + Material Icons
- **状態管理**: Pinia
- **バックエンド**: Supabase (PostgreSQL + Auth)
- **デプロイ**: Vercel

## クイックスタート

### 前提条件

- Node.js v18以上
- npm v9以上
- Supabaseアカウント

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/oncelinks.git
cd oncelinks

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集してSupabaseの認証情報を設定

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### 環境変数

`.env.local`に以下を設定:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
```

詳細は[ドキュメント](./docs/01-setup.md)を参照してください。

## Supabaseセットアップ

### 1. データベーステーブルの作成

Supabase SQL Editorで以下を実行:

```sql
CREATE TABLE once_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  accessed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  CONSTRAINT title_length CHECK (char_length(title) <= 200),
  CONSTRAINT token_length CHECK (char_length(token) >= 32)
);

CREATE INDEX idx_once_links_token ON once_links(token) WHERE is_active = true;
CREATE INDEX idx_once_links_user_id ON once_links(user_id);
CREATE INDEX idx_once_links_created_at ON once_links(created_at DESC);
```

### 2. Row Level Securityの設定

```sql
ALTER TABLE once_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links"
  ON once_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own links"
  ON once_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON once_links FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can access active links by token"
  ON once_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can deactivate accessed links"
  ON once_links FOR UPDATE
  USING (is_active = true)
  WITH CHECK (is_active = false AND accessed_at IS NOT NULL);
```

詳細は[Supabase設定ドキュメント](./docs/03-supabase-configuration.md)を参照してください。

## ドキュメント

完全なドキュメントは`docs/`ディレクトリにあります:

- [セットアップ](./docs/01-setup.md)
- [アーキテクチャ](./docs/02-architecture.md)
- [Supabase設定](./docs/03-supabase-configuration.md)
- [認証](./docs/04-authentication.md)
- [データベーススキーマ](./docs/05-database-schema.md)
- [フロントエンド実装](./docs/06-frontend-implementation.md)
- [一度リンクロジック](./docs/07-once-link-logic.md)
- [エラーハンドリング](./docs/08-error-handling.md)
- [セキュリティ](./docs/09-security.md)
- [デプロイ](./docs/10-deployment.md)
- [テスト](./docs/11-testing.md)
- [トラブルシューティング](./docs/12-troubleshooting.md)

## ビルド

```bash
npm run build
```

ビルド成果物は`dist/`ディレクトリに生成されます。

## デプロイ

Vercelへのデプロイ:

```bash
# Vercel CLIをインストール（初回のみ）
npm i -g vercel

# デプロイ
vercel
```

詳細は[デプロイドキュメント](./docs/10-deployment.md)を参照してください。

## 使い方

### 1. 認証

GitHub、Google、またはメールアドレスでログイン

### 2. リンク作成

1. 「新規リンク作成」をクリック
2. タイトルとHTMLコンテンツを入力
3. 必要に応じて有効期限を設定
4. 「リンクを作成」をクリック

### 3. リンク共有

生成されたURLをコピーして共有

### 4. リンクアクセス

受信者がリンクにアクセスすると:
- コンテンツが表示される
- リンクが自動的に無効化される
- 再度アクセスするとエラーになる

## セキュリティ

- **トークン**: 暗号学的に安全な32文字のランダムトークン
- **RLS**: Row Level Securityによるアクセス制御
- **競合制御**: PostgreSQLの行レベルロックによる安全な無効化
- **HTTPS**: Vercelによる強制HTTPS

詳細は[セキュリティドキュメント](./docs/09-security.md)を参照してください。

## 開発

### コーディング規約

- インデント: 2スペース
- 文字列: シングルクォート
- セミコロンなし
- 変数名: camelCase
- コンポーネント名: PascalCase

### コミットメッセージ規約

Conventional Commitsに従います:

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` コードスタイル
- `refactor:` リファクタリング

## テスト

手動テストチェックリストは[テストドキュメント](./docs/11-testing.md)を参照してください。

## トラブルシューティング

問題が発生した場合は[トラブルシューティングドキュメント](./docs/12-troubleshooting.md)を参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## 貢献

プルリクエストを歓迎します。大きな変更を行う場合は、まずissueを開いて変更内容を議論してください。

## サポート

- **ドキュメント**: [docs/](./docs/)
- **Issues**: GitHubのIssuesで報告してください

## 謝辞

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Material Icons](https://fonts.google.com/icons)
- [Vercel](https://vercel.com/)

---

Made with ❤️ using Vue 3 and Supabase
