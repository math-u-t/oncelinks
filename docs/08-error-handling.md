# 08. エラーハンドリング

## エラー処理戦略

### パターン1: ユーザー操作系

```javascript
try {
  await someAction()
  toast.success('成功メッセージ')
} catch (error) {
  toast.error('エラーメッセージ: ' + error.message)
  console.error('詳細ログ:', error)
}
```

### パターン2: データ取得系

```javascript
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  return data
} catch (error) {
  console.error('取得エラー:', error)
  throw error
}
```

## エラーの分類

### ユーザーエラー
- 入力検証エラー
- 認証エラー
- アクセス権限エラー

**対処**: トースト通知で分かりやすいメッセージを表示

### システムエラー
- ネットワークエラー
- データベースエラー
- 予期しないエラー

**対処**: コンソールログ + エラーページ表示

## ログ出力方針

```javascript
// 開発環境
console.error('詳細エラー:', error)

// 本番環境（将来的）
// Sentryなどのエラートラッキングサービスに送信
```

## トースト通知の使い分け

```javascript
toast.success('成功しました')
toast.error('エラーが発生しました')
toast.warning('警告メッセージ')
toast.info('情報メッセージ')
```
