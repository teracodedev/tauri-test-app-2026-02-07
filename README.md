# tauri-test-app-2026-02-07

Tauri 2.0 で CRUD（作成・読取・更新・削除）だけを行うデスクトップアプリです。

## 必要な環境

- Node.js（npm）
- Rust（Cargo）
- [Tauri 2.0 の環境](https://v2.tauri.app/start/prerequisites/)

## セットアップ・起動

```bash
cd tauri-test-app-2026-02-07
npm install
npm run tauri dev
```

## 機能

- **Create**: タイトル・説明を入力して「追加」で新規項目を作成
- **Read**: 一覧テーブルで全件表示、行ごとに編集・削除
- **Update**: 「編集」で行を編集し「保存」で更新
- **Delete**: 「削除」で項目を削除

データはメモリ上に保持されます（アプリ終了で消えます）。

## デバッグ

1. **起動**  
   - Cursor/VS Code: F5 または「実行とデバッグ」→「Tauri: 開発サーバー起動」で `npm run tauri dev` を実行できます。
   - ターミナル: `npm run tauri dev`

2. **フロント（WebView）**  
   - アプリウィンドウで **右クリック → 検証**（または **Inspect**）で開発者ツールを開けます。
   - `create_item` / `update_item` / `delete_item` / `list_items` のエラーはコンソールに `[コマンド名]` 付きで出力されます。

3. **Rust（バックエンド）**  
   - `npm run tauri dev` を実行したターミナルに、デバッグビルド時は `[create_item]` / `[delete_item]` などの `eprintln!` 出力が表示されます。
