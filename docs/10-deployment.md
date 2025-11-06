# 10. デプロイ

## Vercelへのデプロイ

### 1. GitHubリポジトリの準備

```bash
git add .
git commit -m "feat: complete oncelinks application"
git push origin main
```

### 2. Vercelアカウントの作成

1. [Vercel](https://vercel.com/)にアクセス
2. 「Sign Up」からGitHubでサインアップ
3. GitHubアカウントを連携

### 3. プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」
2. GitHubリポジトリを選択
3. 「Import」をクリック

### 4. ビルド設定

**自動検出されるはずですが、確認:**

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. 環境変数の設定

「Environment Variables」セクションで追加:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_APP_URL=https://your-domain.vercel.app
```

**注意**: `VITE_APP_URL`は実際のVercel URLに変更

### 6. デプロイ

「Deploy」をクリック

**デプロイ時間**: 約2-3分

### 7. カスタムドメインの設定（オプション）

1. 「Settings」→「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定

## デプロイ後の確認

### チェックリスト

- [ ] サイトにアクセスできる
- [ ] ランディングページが表示される
- [ ] ダークモードが動作する
- [ ] 認証ができる（OAuth）
- [ ] リンク作成ができる
- [ ] リンクアクセスができる
- [ ] リンク無効化が動作する

### 動作確認手順

1. サイトにアクセス
2. GitHubでログイン
3. 新規リンクを作成
4. リンクをコピー
5. 別のブラウザ/シークレットモードでアクセス
6. コンテンツが表示されることを確認
7. 再度アクセスしてエラーになることを確認

## 自動デプロイ

### mainブランチへのpush

```bash
git push origin main
```

→ 自動的にVercelが検知してデプロイ

### プレビューデプロイ

プルリクエストを作成すると、自動的にプレビュー環境が作成されます。

## ロールバック

1. Vercelダッシュボードで「Deployments」を選択
2. 以前のデプロイメントを選択
3. 「...」→「Promote to Production」

## パフォーマンス最適化

### 1. ビルドサイズの確認

```bash
npm run build
```

`dist/`ディレクトリのサイズを確認

### 2. Lighthouse監査

Chrome DevToolsで「Lighthouse」タブ
- Performance
- Accessibility
- Best Practices
- SEO

### 3. 画像最適化（将来的）

Vercel Image Optimizationを活用

## トラブルシューティング

### デプロイ失敗: Build Error

**原因**: ビルドエラー

**解決**:
```bash
npm run build
```
ローカルでビルドエラーを解決

### 環境変数が反映されない

**原因**: 環境変数の設定ミス

**解決**:
1. Vercel「Settings」→「Environment Variables」確認
2. 変数名が`VITE_`で始まっていることを確認
3. 再デプロイ

### 認証リダイレクトエラー

**原因**: SupabaseのリダイレクトURL設定

**解決**:
1. Supabase「Authentication」→「URL Configuration」
2. Vercel URLを追加
3. 例: `https://your-domain.vercel.app/dashboard`
