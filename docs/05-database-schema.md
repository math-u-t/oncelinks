# 05. データベーススキーマ

## once_linksテーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY | リンクID |
| user_id | UUID | FOREIGN KEY | 作成者のユーザーID |
| token | TEXT | UNIQUE NOT NULL | アクセストークン（32文字以上） |
| title | TEXT | NOT NULL | リンクタイトル（200文字以内） |
| html_content | TEXT | NOT NULL | HTMLコンテンツ |
| storage_path | TEXT | NULL | Storageパス（将来的な拡張用） |
| is_active | BOOLEAN | DEFAULT true | アクティブ状態 |
| accessed_at | TIMESTAMP | NULL | アクセス日時 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| expires_at | TIMESTAMP | NULL | 有効期限 |
| access_count | INTEGER | DEFAULT 0 | アクセス回数 |

## インデックス

```sql
-- トークン検索の高速化（部分インデックス）
CREATE INDEX idx_once_links_token ON once_links(token) WHERE is_active = true;

-- ユーザーのリンク一覧取得の高速化
CREATE INDEX idx_once_links_user_id ON once_links(user_id);

-- 作成日時でのソートの高速化
CREATE INDEX idx_once_links_created_at ON once_links(created_at DESC);
```

## RLSポリシー

### 1. Users can view own links
- ユーザーは自分のリンクのみ閲覧可能
- `auth.uid() = user_id`

### 2. Users can create own links
- ユーザーは自分のリンクのみ作成可能
- `auth.uid() = user_id`

### 3. Users can delete own links
- ユーザーは自分のリンクのみ削除可能
- `auth.uid() = user_id`

### 4. Anyone can access active links by token
- アクティブなリンクは誰でもトークンでアクセス可能
- `is_active = true`

### 5. Anyone can deactivate accessed links
- リンクの無効化は誰でも可能（一度リンクアクセス時）
- `USING (is_active = true)`
- `WITH CHECK (is_active = false AND accessed_at IS NOT NULL)`

## マイグレーション

Supabaseではマイグレーションを手動で管理します。

### 初期マイグレーション

SQL Editorで[03-supabase-configuration.md](./03-supabase-configuration.md)のSQLを実行。

### 将来的なマイグレーション

変更が必要な場合:
1. SQL Editorで新しいマイグレーションを作成
2. `ALTER TABLE`文で変更
3. 本番環境にも同じSQLを実行
