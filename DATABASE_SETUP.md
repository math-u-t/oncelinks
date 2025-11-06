# OnceLinks データベースセットアップガイド

このガイドでは、OnceLinksアプリケーションの新機能に必要なデータベース更新手順を説明します。

## 🎯 新機能

このアップデートには以下の機能が含まれています：

1. **リンク編集機能** - アクティブなリンクの内容を編集可能
2. **ゴミ箱機能** - 削除されたリンクを一時的に保管し、復元可能
3. **一度きりアクセスの改善** - アトミックな操作で完全な一度きりアクセスを実現
4. **設定ページ** - パスワード変更などのアカウント管理
5. **HTMLプレビュー** - エディタ内でHTMLをプレビュー
6. **ログインモーダル** - どのページからでもログイン可能

## 📋 必要なデータベース更新

### ステップ1: Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. OnceLinksプロジェクトを選択
3. 左サイドバーから「SQL Editor」をクリック

### ステップ2: SQLスクリプトを実行

`database-updates.sql`ファイルの内容をコピーして、SQLエディタに貼り付けて実行します。

このスクリプトは以下を実行します：

#### 1. テーブルカラムの追加

```sql
ALTER TABLE once_links
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
```

- `updated_at` - リンクが最後に更新された日時（自動更新）
- `deleted_at` - リンクが削除された日時（NULL = 削除されていない）

#### 2. 自動更新トリガー

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_once_links_updated_at
    BEFORE UPDATE ON once_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

リンクが更新されると、`updated_at`が自動的に現在時刻に更新されます。

#### 3. アトミックなリンク取得・無効化RPC関数

```sql
CREATE OR REPLACE FUNCTION fetch_and_deactivate_link(link_token TEXT)
RETURNS TABLE (...) AS $$
...
```

この関数は、リンクの取得と無効化を1つのトランザクションで実行します。
これにより、複数の同時アクセスがあっても、確実に1回だけ表示されます。

#### 4. インデックスの追加

```sql
CREATE INDEX IF NOT EXISTS idx_once_links_deleted_at ON once_links(deleted_at);
CREATE INDEX IF NOT EXISTS idx_once_links_user_deleted ON once_links(user_id, deleted_at);
```

ゴミ箱機能のパフォーマンスを向上させます。

#### 5. RLSポリシーの更新

既存のポリシーを更新し、削除済みリンクも含めてユーザーが自分のリンクを管理できるようにします。

#### 6. ユーザープロフィールテーブル（オプション）

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

将来の機能拡張のためのテーブルです。現時点では必須ではありません。

### ステップ3: 実行確認

SQLスクリプトが正常に実行されると、以下のメッセージが表示されます：

```
データベース更新が完了しました！
- リンク編集機能: updated_atカラム追加
- ゴミ箱機能: deleted_atカラム追加
- 一度きりアクセス: fetch_and_deactivate_link RPC関数追加
- ユーザープロフィール: user_profilesテーブル追加
```

### ステップ4: 確認クエリ

以下のクエリで、更新が正しく適用されたか確認できます：

```sql
-- カラムの確認
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'once_links'
  AND column_name IN ('updated_at', 'deleted_at');

-- RPC関数の確認
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'fetch_and_deactivate_link';

-- インデックスの確認
SELECT indexname
FROM pg_indexes
WHERE tablename = 'once_links'
  AND indexname IN ('idx_once_links_deleted_at', 'idx_once_links_user_deleted');
```

## 🚨 トラブルシューティング

### エラー: "column already exists"

既に`updated_at`や`deleted_at`カラムが存在する場合、このエラーは無視できます。
スクリプトは`IF NOT EXISTS`を使用しているため、既存のデータには影響しません。

### エラー: "permission denied"

RLSポリシーまたはRPC関数の作成に失敗する場合：
1. Supabaseプロジェクトの所有者としてログインしていることを確認
2. SQLエディタで「Run」ボタンを使用していることを確認

### RPC関数が動作しない

1. Supabaseのログでエラーメッセージを確認
2. 関数の権限を確認：
```sql
GRANT EXECUTE ON FUNCTION fetch_and_deactivate_link TO authenticated;
```

## 🔄 既存データの移行

既存のリンクには、以下のデフォルト値が適用されます：
- `updated_at`: `created_at`の値（または現在時刻）
- `deleted_at`: `NULL`（削除されていない状態）

既存のリンクを一括で初期化する場合：

```sql
-- updated_atをcreated_atと同じに設定
UPDATE once_links
SET updated_at = created_at
WHERE updated_at IS NULL;

-- deleted_atはデフォルトでNULLなので、特に操作は不要
```

## 📝 注意事項

1. **バックアップ**: データベースの変更前に、必ずバックアップを作成してください
2. **本番環境**: 本番環境で実行する前に、開発環境でテストしてください
3. **ダウンタイム**: これらの操作は通常、ダウンタイムなしで実行できます

## ✅ 次のステップ

データベースの更新が完了したら：

1. アプリケーションを再起動（必要に応じて）
2. 新機能をテスト：
   - リンクの編集
   - ゴミ箱への移動と復元
   - 一度きりアクセスの動作確認
   - 設定ページでのパスワード変更

## 🆘 サポート

問題が発生した場合：
1. Supabaseのログを確認
2. ブラウザのコンソールでエラーを確認
3. GitHubのIssueを作成

## 📚 関連ドキュメント

- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
