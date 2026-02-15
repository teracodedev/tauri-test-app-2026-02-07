# API（CRUD）

Tauri アプリ用の REST API。同じリポジトリ内の `api/` に配置しています。

- **Supabase** を利用する場合: 環境変数で接続先を指定すると、データが Supabase に永続化されます。
- **未設定の場合**: メモリモードで動作し、再起動でデータは消えます。

## セットアップ

```bash
cd api
npm install
```

## 起動

```bash
npm run dev
```

- **URL**: http://localhost:3000
- **エンドポイント**: `GET/POST /api/items`, `GET/PUT/DELETE /api/items/:id`

## Supabase に接続する

1. [Supabase](https://supabase.com) でプロジェクトを作成し、`api/docs/supabase-items-table.sql` で `items` テーブルを作成しておきます。
2. Supabase Dashboard → **Settings** → **API** で次を確認します。
   - **Project URL** → `SUPABASE_URL`
   - **anon public** キー → `SUPABASE_ANON_KEY`
3. **`api/.env`** を作成し、**2行**で次のように書きます（1行にまとめず、`=` の前後にスペースを入れない）。

   ```env
   SUPABASE_URL=https://あなたのプロジェクトID.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. `npm run dev` で API を起動します。

起動ログに「永続化: Supabase」と出れば、Supabase に接続されています。
