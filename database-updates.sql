-- OnceLinks データベース更新SQL
-- このSQLをSupabaseのSQLエディタで実行してください

-- 1. リンク編集とゴミ箱機能のためのカラムを追加
ALTER TABLE once_links
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. トリガーを作成（既に存在する場合は削除してから作成）
DROP TRIGGER IF EXISTS update_once_links_updated_at ON once_links;
CREATE TRIGGER update_once_links_updated_at
    BEFORE UPDATE ON once_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. 一度きりアクセスをアトミックに処理するRPC関数
CREATE OR REPLACE FUNCTION fetch_and_deactivate_link(link_token TEXT)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    token TEXT,
    title TEXT,
    html_content TEXT,
    is_active BOOLEAN,
    accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER,
    deleted_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    link_record RECORD;
BEGIN
    -- アクティブなリンクを取得して即座に無効化（アトミック操作）
    UPDATE once_links
    SET
        is_active = false,
        accessed_at = NOW(),
        access_count = access_count + 1
    WHERE
        once_links.token = link_token
        AND once_links.is_active = true
        AND once_links.deleted_at IS NULL
        AND (once_links.expires_at IS NULL OR once_links.expires_at > NOW())
    RETURNING * INTO link_record;

    -- 更新された行が存在する場合のみ返す
    IF link_record.id IS NOT NULL THEN
        RETURN QUERY SELECT
            link_record.id,
            link_record.user_id,
            link_record.token,
            link_record.title,
            link_record.html_content,
            link_record.is_active,
            link_record.accessed_at,
            link_record.created_at,
            link_record.updated_at,
            link_record.expires_at,
            link_record.access_count,
            link_record.deleted_at;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. deleted_atのインデックスを追加（ゴミ箱機能の高速化）
CREATE INDEX IF NOT EXISTS idx_once_links_deleted_at ON once_links(deleted_at);
CREATE INDEX IF NOT EXISTS idx_once_links_user_deleted ON once_links(user_id, deleted_at);

-- 6. RLSポリシーを更新（ゴミ箱機能用）
-- ユーザーは自分のリンク（削除済みを含む）を閲覧可能
DROP POLICY IF EXISTS "Users can view own links" ON once_links;
CREATE POLICY "Users can view own links" ON once_links
    FOR SELECT
    USING (auth.uid() = user_id);

-- ユーザーは自分のリンクを更新可能（削除フラグの設定を含む）
DROP POLICY IF EXISTS "Users can update own links" ON once_links;
CREATE POLICY "Users can update own links" ON once_links
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 7. パスワード更新用のメタデータテーブル（オプション）
-- Supabase Authは既にユーザー管理機能を持っているため、
-- 追加のテーブルは不要ですが、将来の拡張のために準備
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロフィールのみ閲覧・更新可能
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- プロフィールのupdated_atを自動更新
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE 'データベース更新が完了しました！';
    RAISE NOTICE '- リンク編集機能: updated_atカラム追加';
    RAISE NOTICE '- ゴミ箱機能: deleted_atカラム追加';
    RAISE NOTICE '- 一度きりアクセス: fetch_and_deactivate_link RPC関数追加';
    RAISE NOTICE '- ユーザープロフィール: user_profilesテーブル追加';
END $$;
