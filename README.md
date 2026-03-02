# tauri-test-app-2026-02-07

Tauri 2.0 で CRUD（作成・読取・更新・削除）だけを行うデスクトップアプリです。

## リポジトリ構成

- **ルート** … Tauri アプリ（フロント + Rust）
- **api/** … TypeScript の REST API（同じリポジトリ内）。Tauri から `fetch` で呼ぶか、将来 Aurora DSQL 等に永続化する際のバックエンドとして利用できます。起動は `cd api && npm install && npm run dev`（詳細は [api/README.md](api/README.md)）。

## 必要な環境

- Node.js（npm）
- Rust（Cargo）
- [Tauri 2.0 の環境](https://v2.tauri.app/start/prerequisites/)

## セットアップ・起動

**Supabase にデータを保存する場合**は、**先に API サーバーを起動**してください。

1. **API の起動**（別ターミナルで）:
   ```bash
   cd api
   npm install
   npm run dev
   ```
   - `api/.env` に `SUPABASE_URL` と `SUPABASE_ANON_KEY` を設定し、Supabase で `api/docs/supabase-items-table.sql` を実行して `items` テーブルを作成しておいてください（詳細は [api/README.md](api/README.md)）。

2. **Tauri アプリの起動**:
   ```bash
   cd tauri-test-app-2026-02-07
   npm install
   npm run tauri dev
   ```

API を起動していないと「API サーバーに接続できません」と表示されます。その場合は上記 1 の API を起動してから再度お試しください。

## 機能

- **Create**: タイトル・説明を入力して「追加」で新規項目を作成
- **Read**: 一覧テーブルで全件表示、行ごとに編集・削除
- **Update**: 「編集」で行を編集し「保存」で更新
- **Delete**: 「削除」で項目を削除

データは **API 経由で Supabase** に保存されます（API 未起動時はエラーになります）。

## デバッグ

1. **起動**  
   - Cursor/VS Code: F5 または「実行とデバッグ」→「Tauri: 開発サーバー起動」で `npm run tauri dev` を実行できます。
   - ターミナル: `npm run tauri dev`

2. **フロント（WebView）**  
   - アプリウィンドウで **右クリック → 検証**（または **Inspect**）で開発者ツールを開けます。
   - `create_item` / `update_item` / `delete_item` / `list_items` のエラーはコンソールに `[コマンド名]` 付きで出力されます。

3. **Rust（バックエンド）**  
   - `npm run tauri dev` を実行したターミナルに、デバッグビルド時は `[create_item]` / `[delete_item]` などの `eprintln!` 出力が表示されます。
