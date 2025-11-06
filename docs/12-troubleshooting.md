# 12. トラブルシューティング

## よくある問題と解決方法

### 1. 環境変数が読み込まれない

**症状**: `Supabase configuration is missing`エラー

**原因**:
- `.env.local`ファイルが存在しない
- ファイル内の変数名が間違っている
- 開発サーバーが再起動されていない

**解決方法**:
```bash
# 1. ファイルの存在確認
ls -la .env.local

# 2. 内容確認
cat .env.local

# 3. 正しい変数名か確認
# VITE_SUPABASE_URL（VITE_プレフィックス必須）
# VITE_SUPABASE_ANON_KEY
# VITE_APP_URL

# 4. 開発サーバー再起動
npm run dev
```

### 2. Supabase接続エラー

**症状**: API呼び出しが401 Unauthorizedエラー

**原因**:
- APIキーが間違っている
- SupabaseプロジェクトURLが間違っている

**解決方法**:
1. Supabaseダッシュボードで「Settings」→「API」
2. **Project URL**と**anon public**キーを再確認
3. `.env.local`を更新
4. 開発サーバー再起動

### 3. 認証リダイレクトが動作しない

**症状**: OAuth認証後にエラーページ

**原因**: リダイレクトURLの設定ミス

**解決方法**:
1. Supabase「Authentication」→「URL Configuration」
2. 「Redirect URLs」に以下を追加:
   ```
   http://localhost:5173/dashboard
   http://localhost:5173/**
   ```
3. GitHubまたはGoogleの設定でコールバックURLを確認
4. URLが完全に一致していることを確認

### 4. リンクが無効化されない

**症状**: リンクに何度もアクセスできる

**原因**: RLSポリシーの設定ミス

**解決方法**:
1. Supabase SQL Editorで確認:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'once_links';
   ```
2. 5つのポリシーがあることを確認
3. ない場合は[03-supabase-configuration.md](./03-supabase-configuration.md)のSQLを再実行

### 5. ダークモードが保存されない

**症状**: リロード後にダークモードが解除される

**原因**: localStorageが無効化されている

**解決方法**:
1. ブラウザのコンソールで確認:
   ```javascript
   localStorage.getItem('oncelinks-theme')
   ```
2. プライベートモードでないことを確認
3. ブラウザの設定でlocalStorageが有効か確認

### 6. Material Iconsが表示されない

**症状**: アイコンが表示されず、テキストが表示される

**原因**: CDNが読み込まれていない

**解決方法**:
1. `index.html`を確認:
   ```html
   <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
   ```
2. ネットワークタブで読み込みを確認
3. AdBlockerが無効か確認

### 7. ビルドエラー

**症状**: `npm run build`が失敗

**エラー例**:
```
[vite]: Rollup failed to resolve import
```

**解決方法**:
```bash
# 1. node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install

# 2. キャッシュをクリア
npm run build -- --force

# 3. Node.jsバージョン確認
node --version  # v18以上必要
```

### 8. Vercelデプロイ失敗

**症状**: デプロイがBuild Errorで失敗

**解決方法**:
1. Vercelのデプロイログを確認
2. ローカルでビルドテスト:
   ```bash
   npm run build
   ```
3. エラーを修正してpush
4. 環境変数が設定されているか確認

### 9. データベースクエリが遅い

**症状**: リンク一覧の読み込みが遅い

**解決方法**:
1. インデックスが作成されているか確認:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'once_links';
   ```
2. クエリを最適化（不要なカラムを取得しない）
3. ページネーションの実装を検討

### 10. トーストが表示されない

**症状**: 成功/エラーメッセージが表示されない

**原因**: Toastコンポーネントがマウントされていない

**解決方法**:
1. `App.vue`に`<Toast />`があるか確認
2. `useToast()`が正しく呼ばれているか確認
3. ブラウザコンソールでエラーがないか確認

## デバッグ手順

### 1. ブラウザ開発者ツール

**Console**:
- JavaScriptエラーを確認
- `console.log()`でデバッグ

**Network**:
- API呼び出しを確認
- レスポンスステータスを確認
- ペイロードを確認

**Application**:
- localStorageを確認
- Cookieを確認

### 2. Supabase管理画面

**Table Editor**:
- データを直接確認
- 手動でデータを修正

**SQL Editor**:
- クエリを直接実行
- デバッグクエリを実行

**Logs**:
- エラーログを確認
- スロークエリを確認

### 3. Vue DevTools

1. [Vue DevTools](https://devtools.vuejs.org/)をインストール
2. Components タブでコンポーネントツリーを確認
3. State タブでPiniaストアの状態を確認

## ログの見方

### Supabaseログ

1. Supabaseダッシュボード
2. 「Logs」を選択
3. フィルターでエラーのみ表示

### Vercelログ

1. Vercelダッシュボード
2. 「Deployments」→ デプロイを選択
3. 「Build Logs」でビルドログ確認
4. 「Function Logs」でランタイムログ確認

## サポート

問題が解決しない場合:

1. GitHubでissueを作成
2. 以下の情報を含める:
   - エラーメッセージ
   - 再現手順
   - 環境情報（OS, ブラウザ, Node.jsバージョン）
   - スクリーンショット
