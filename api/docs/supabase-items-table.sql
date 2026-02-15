-- ============================================================
-- Supabase 用: items テーブル作成
-- Supabase Dashboard → SQL Editor でこのファイルの内容を貼り付けて実行
-- ============================================================

-- テーブル作成（id は UUID、アプリでは文字列として扱います）
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 作成日時で並べ替えやすいようにインデックス（任意）
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items (created_at DESC);

-- Row Level Security (RLS) を有効化
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- anon キーで REST API から全操作を許可するポリシー
-- （開発・簡易利用向け。本番では認証済みユーザーだけに制限することを推奨）
CREATE POLICY "Allow anon all on items"
  ON items
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 既存の authenticated ロールでも同様に許可する場合（ログイン済みユーザー用）
CREATE POLICY "Allow authenticated all on items"
  ON items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 実行後、Table Editor で items が表示されていれば成功です。
-- REST API は /rest/v1/items で利用できます。
-- ============================================================
