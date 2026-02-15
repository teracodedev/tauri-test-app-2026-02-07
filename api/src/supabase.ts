import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { existsSync } from "fs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");

const loaded = config({ path: envPath });
if (!loaded.parsed && process.env.NODE_ENV !== "production") {
  config({ path: path.resolve(process.cwd(), ".env") });
}

if (process.env.NODE_ENV !== "production") {
  const keys = loaded.parsed ? Object.keys(loaded.parsed) : [];
  console.log("[.env] パス:", envPath);
  console.log("[.env] ファイル存在:", existsSync(envPath), "| 読み取ったキー:", keys.length ? keys.join(", ") : "なし");
}

const url = process.env.SUPABASE_URL?.trim();
const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey);
}

export function getSupabase(): SupabaseClient | null {
  return client;
}

export function isSupabaseEnabled(): boolean {
  return Boolean(client);
}

export type Item = {
  id: string;
  title: string;
  description: string;
};
