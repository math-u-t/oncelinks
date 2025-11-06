# 02. アーキテクチャ

## システム全体のアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Vue 3 + Vite (SPA)                   │  │
│  │                                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │  Views   │  │Components│  │  Stores  │      │  │
│  │  │  (Pages) │  │   (UI)   │  │ (Pinia)  │      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  │         │            │              │            │  │
│  │         └────────────┴──────────────┘            │  │
│  │                      │                            │  │
│  │              ┌───────▼────────┐                  │  │
│  │              │   Composables  │                  │  │
│  │              │   useSupabase  │                  │  │
│  │              └───────┬────────┘                  │  │
│  └──────────────────────┼──────────────────────────┘  │
└─────────────────────────┼─────────────────────────────┘
                          │ HTTPS
                          ▼
        ┌──────────────────────────────────┐
        │         Supabase Cloud           │
        │                                  │
        │  ┌────────────┐  ┌────────────┐ │
        │  │  Auth API  │  │ PostgreSQL │ │
        │  │  (OAuth)   │  │    + RLS   │ │
        │  └────────────┘  └────────────┘ │
        └──────────────────────────────────┘
```

## 技術スタック選定理由

### フロントエンド

**Vue 3 + Composition API**
- リアクティブな状態管理
- コンポーネント指向で再利用性が高い
- TypeScriptとの親和性（将来的な拡張）

**Vite**
- 高速な開発サーバー
- HMR（Hot Module Replacement）
- 最適化されたビルド

**Tailwind CSS**
- ユーティリティファースト
- ダークモード対応が簡単
- カスタマイズ性が高い

**Pinia**
- Vue 3公式の状態管理
- Composition APIネイティブ
- TypeScript完全対応

### バックエンド

**Supabase**
- PostgreSQLベース
- 認証機能が組み込み
- Row Level Security
- リアルタイム機能（将来的な拡張）

## ディレクトリ構造と責務

```
src/
├── assets/          # 静的アセット（CSS）
├── components/      # 再利用可能なUIコンポーネント
│   ├── Navbar.vue          # ナビゲーションバー
│   ├── Toast.vue           # 通知コンポーネント
│   ├── ThemeToggle.vue     # テーマ切り替え
│   ├── LinkCard.vue        # リンクカード
│   └── HtmlEditor.vue      # HTMLエディタ
├── views/           # ページコンポーネント
│   ├── Home.vue            # ランディングページ
│   ├── Dashboard.vue       # ダッシュボード
│   ├── NewLink.vue         # 新規リンク作成
│   └── OnceLinkView.vue    # 一度リンク表示
├── stores/          # Pinia状態管理
│   ├── auth.js             # 認証状態
│   ├── links.js            # リンク管理
│   └── theme.js            # テーマ管理
├── router/          # ルーティング
│   └── index.js            # ルート定義
├── composables/     # 再利用可能なロジック
│   ├── useSupabase.js      # Supabaseクライアント
│   └── useToast.js         # トースト通知
├── utils/           # ユーティリティ関数
│   ├── tokenGenerator.js   # トークン生成
│   └── validators.js       # バリデーション
├── App.vue          # ルートコンポーネント
└── main.js          # エントリーポイント
```

## データフロー

### 1. 認証フロー

```
User → Navbar → authStore.signIn()
        ↓
   useSupabase() → Supabase Auth API
        ↓
   OAuth Provider (GitHub/Google)
        ↓
   Callback → authStore.user updated
        ↓
   Router Guard → Navigate to Dashboard
```

### 2. リンク作成フロー

```
User → NewLink.vue → Form Submit
        ↓
   Validation (validators.js)
        ↓
   linksStore.createLink()
        ↓
   generateToken() (tokenGenerator.js)
        ↓
   useSupabase() → Supabase Database
        ↓
   RLS Check → INSERT allowed
        ↓
   Success → Toast Notification
        ↓
   Router → Navigate to Dashboard
```

### 3. 一度リンクアクセスフロー

```
User → OnceLinkView.vue (token in URL)
        ↓
   linksStore.fetchLinkByToken()
        ↓
   useSupabase() → Supabase Database
        ↓
   SELECT where is_active=true
        ↓
   Link Found → Display Content
        ↓
   linksStore.deactivateLink()
        ↓
   UPDATE is_active=false
        ↓
   Success → Link is now inactive
```

## 状態管理戦略（Pinia）

### authStore
- **責務**: ユーザー認証状態の管理
- **State**: user, session, loading
- **Actions**: initialize, signIn, signUp, signOut

### linksStore
- **責務**: リンクのCRUD操作
- **State**: links, loading, currentLink
- **Actions**: fetchLinks, createLink, deleteLink, deactivateLink

### themeStore
- **責務**: UIテーマの管理
- **State**: isDark
- **Actions**: initialize, toggle, setTheme

## セキュリティレイヤー

### 1. フロントエンド
- 入力バリデーション（validators.js）
- XSS対策（v-htmlの制限的使用）
- CSRF対策（Supabaseトークン）

### 2. Supabase
- Row Level Security (RLS)
- OAuth認証
- APIキーによるアクセス制御

### 3. ネットワーク
- HTTPS強制
- Secure headers (Vercel)

## パフォーマンス最適化

### 1. コード分割
- Vue Routerの動的インポート
- ページごとのチャンク分割

### 2. 最適化されたビルド
- Viteの tree-shaking
- CSS minification
- 画像最適化（将来的）

### 3. キャッシング
- Supabaseクライアントのシングルトン
- Vue Routerのナビゲーションガード

## スケーラビリティ

### 現在のアーキテクチャ
- 単一リージョンのSupabase
- クライアントサイドレンダリング（CSR）
- Vercel Edge Network

### 将来的な拡張
- 複数リージョンのデータベースレプリケーション
- サーバーサイドレンダリング（SSR）検討
- CDNによるアセット配信
- リアルタイム同期（Supabase Realtime）
