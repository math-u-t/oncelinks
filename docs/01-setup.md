# 01. セットアップ

## 概要

このドキュメントでは、oncelinksプロジェクトの環境構築と初期セットアップ手順を説明します。

## 対象読者

- Node.jsの基本的な知識がある開発者
- Vue.jsの基礎を理解している方

## 前提条件

以下のソフトウェアがインストールされていることを確認してください：

- **Node.js**: v18以上推奨
- **npm**: v9以上推奨
- **Git**: 最新版

### バージョン確認

```bash
node --version  # v18.0.0以上
npm --version   # v9.0.0以上
git --version   # 任意のバージョン
```

## 手順

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd oncelinks
```

### 2. 依存パッケージのインストール

```bash
npm install
```

**期待される結果:**
- `node_modules/`ディレクトリが作成される
- 約160個のパッケージがインストールされる
- エラーなく完了する

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local`を編集し、以下の値を設定します：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
```

**注意:** Supabaseの値は[03. Supabase設定](./03-supabase-configuration.md)を参照してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

**期待される結果:**
```
  VITE v5.1.5  ready in 2秒

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

ブラウザで http://localhost:5173 を開き、ランディングページが表示されることを確認します。

### 5. ビルドテスト

```bash
npm run build
```

**期待される結果:**
```
vite v5.1.5 building for production...
✓ 150 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-xxxxx.css      12.34 kB
dist/assets/index-xxxxx.js      234.56 kB
✓ built in 3.45s
```

## チェックポイント

以下を確認してください：

- [ ] `npm install`がエラーなく完了した
- [ ] `.env.local`ファイルが作成され、環境変数が設定されている
- [ ] `npm run dev`で開発サーバーが起動する
- [ ] ブラウザでhttp://localhost:5173にアクセスできる
- [ ] ランディングページが正しく表示される
- [ ] `npm run build`でビルドが成功する

## トラブルシューティング

### エラー: `Cannot find module`

**原因:** 依存パッケージがインストールされていない

**解決方法:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### エラー: `Port 5173 is already in use`

**原因:** ポート5173が既に使用されている

**解決方法:**
```bash
# 他のプロセスを終了するか、別のポートを使用
npm run dev -- --port 3000
```

### エラー: `Supabase configuration is missing`

**原因:** 環境変数が設定されていない

**解決方法:**
1. `.env.local`ファイルが存在することを確認
2. ファイル内の環境変数が正しく設定されていることを確認
3. 開発サーバーを再起動

## 次のステップ

セットアップが完了したら、以下のドキュメントに進んでください：

1. [02. アーキテクチャ](./02-architecture.md) - システム設計の理解
2. [03. Supabase設定](./03-supabase-configuration.md) - バックエンドの設定

## 参考資料

- [Vite公式ドキュメント](https://vitejs.dev/)
- [Vue 3公式ドキュメント](https://vuejs.org/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/)
