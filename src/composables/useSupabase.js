import { createClient } from '@supabase/supabase-js'

// 環境変数の検証
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません。.env.localファイルを確認してください。')
  throw new Error('Supabase configuration is missing. Please check your .env.local file.')
}

// Supabaseクライアントのシングルトン
let supabase = null

/**
 * Supabaseクライアントを取得
 * シングルトンパターンで実装
 * @returns {SupabaseClient} - Supabaseクライアントインスタンス
 */
export function useSupabase() {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  }

  return supabase
}

// デフォルトエクスポート
export default useSupabase
