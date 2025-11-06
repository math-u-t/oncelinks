# oncelinks ドキュメント

## プロジェクト概要

**oncelinks**は、一度限りアクセス可能なリンクを生成・管理するWebアプリケーションです。HTMLコンテンツを含むリンクを作成し、一度アクセスされると自動的に無効化されます。

## 技術スタック

- **フロントエンド**: Vue 3 (Composition API) + Vite
- **スタイリング**: Tailwind CSS + ダークモード対応
- **アイコン**: Google Material Icons
- **状態管理**: Pinia
- **バックエンド**: Supabase (Auth + Database)
- **デプロイ**: Vercel
- **認証**: GitHub, Google, Email, Username/Password

## クイックスタート

```bash
# リポジトリをクローン
git clone <repository-url>
cd oncelinks

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集してSupabaseの認証情報を設定

# 開発サーバーを起動
npm run dev

# ビルド
npm run build
```

## ドキュメント目次

### セットアップとインストール
- [01. セットアップ](./01-setup.md) - 環境構築と初期セットアップ手順
- [02. アーキテクチャ](./02-architecture.md) - システム全体のアーキテクチャ設計
- [03. Supabase設定](./03-supabase-configuration.md) - データベースと認証の設定

### 実装ガイド
- [04. 認証](./04-authentication.md) - 認証フローの実装詳細
- [05. データベーススキーマ](./05-database-schema.md) - テーブル設計とマイグレーション
- [06. フロントエンド実装](./06-frontend-implementation.md) - Vue.jsコンポーネント実装
- [07. 一度リンクロジック](./07-once-link-logic.md) - 無効化ロジックの核心部分
- [08. エラーハンドリング](./08-error-handling.md) - エラー処理戦略

### セキュリティとデプロイ
- [09. セキュリティ](./09-security.md) - セキュリティ要件とベストプラクティス
- [10. デプロイ](./10-deployment.md) - Vercelへのデプロイ手順

### テストとトラブルシューティング
- [11. テスト](./11-testing.md) - テスト戦略とテストケース
- [12. トラブルシューティング](./12-troubleshooting.md) - よくある問題と解決方法

## 主要機能

### 1. 一度リンク生成
- 暗号学的に安全なトークン生成
- HTMLコンテンツの保存
- 有効期限の設定（オプション）

### 2. 自動無効化
- 初回アクセス時に自動無効化
- 競合制御による安全な無効化
- 有効期限のチェック

### 3. ダッシュボード
- リンク一覧表示
- ステータス管理（アクティブ/使用済み）
- リンクの削除

### 4. 認証システム
- OAuth認証（GitHub, Google）
- メール+パスワード認証
- セッション管理

### 5. UI/UX
- レスポンシブデザイン
- ダークモード対応
- Material Icons統一
- トースト通知

## ディレクトリ構造

```
oncelinks/
├── docs/                    # ドキュメント
├── src/
│   ├── assets/             # CSS等のアセット
│   ├── components/         # 再利用可能なコンポーネント
│   ├── views/              # ページコンポーネント
│   ├── stores/             # Pinia状態管理
│   ├── router/             # Vue Router設定
│   ├── composables/        # Composition API関数
│   ├── utils/              # ユーティリティ関数
│   ├── App.vue             # ルートコンポーネント
│   └── main.js             # アプリエントリーポイント
├── public/                 # 静的アセット
├── .env.local             # 環境変数（gitignore対象）
├── .env.local.example     # 環境変数テンプレート
├── package.json           # 依存パッケージ
├── vite.config.js         # Vite設定
├── tailwind.config.js     # Tailwind CSS設定
└── vercel.json            # Vercelデプロイ設定
```

## 開発ワークフロー

### 1. ローカル開発
```bash
npm run dev
```
http://localhost:5173 でアクセス

### 2. ビルド
```bash
npm run build
```

### 3. プレビュー
```bash
npm run preview
```

## 環境変数

必須の環境変数：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
```

## サポート

問題が発生した場合は、[12. トラブルシューティング](./12-troubleshooting.md)を参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストを歓迎します。大きな変更を行う場合は、まずissueを開いて変更内容を議論してください。
