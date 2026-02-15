import "dotenv/config";
import express, { Request, Response } from "express";
import { getSupabase, isSupabaseEnabled, type Item } from "./supabase.js";

const app = express();
const port = 3000;

app.use(express.json());

// メモリフォールバック（SUPABASE_URL 未設定時）
const memoryItems: Item[] = [];
let memoryNextId = 1;

async function listItems(): Promise<Item[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("items")
      .select("id, title, description")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      title: row.title ?? "",
      description: row.description ?? "",
    }));
  }
  return [...memoryItems];
}

async function getItem(id: string): Promise<Item | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("items")
      .select("id, title, description")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    if (!data) return null;
    return {
      id: String(data.id),
      title: data.title ?? "",
      description: data.description ?? "",
    };
  }
  return memoryItems.find((i) => i.id === id) ?? null;
}

async function createItem(title: string, description: string): Promise<Item> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("items")
      .insert({ title: title ?? "", description: description ?? "" })
      .select("id, title, description")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Insert did not return row");
    return {
      id: String(data.id),
      title: data.title ?? "",
      description: data.description ?? "",
    };
  }
  const id = String(memoryNextId++);
  const item: Item = { id, title: title ?? "", description: description ?? "" };
  memoryItems.push(item);
  return item;
}

async function updateItem(id: string, title: string, description: string): Promise<Item | null> {
  const supabase = getSupabase();
  if (supabase) {
    const updates: { title?: string; description?: string } = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    const { data, error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", id)
      .select("id, title, description")
      .single();
    if (error) throw error;
    if (!data) return null;
    return {
      id: String(data.id),
      title: data.title ?? "",
      description: data.description ?? "",
    };
  }
  const idx = memoryItems.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  memoryItems[idx] = {
    id,
    title: title ?? memoryItems[idx].title,
    description: description ?? memoryItems[idx].description,
  };
  return memoryItems[idx];
}

async function deleteItem(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const existing = await getItem(id);
    if (!existing) return false;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
  const idx = memoryItems.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  memoryItems.splice(idx, 1);
  return true;
}

// 一覧
app.get("/api/items", async (_req: Request, res: Response) => {
  try {
    const items = await listItems();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// 1件取得
app.get("/api/items/:id", async (req: Request, res: Response) => {
  try {
    const item = await getItem(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// 作成
app.post("/api/items", async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body ?? {};
    const item = await createItem(title, description);
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// 更新
app.put("/api/items/:id", async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body ?? {};
    const item = await updateItem(req.params.id, title, description);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// 削除
app.delete("/api/items/:id", async (req: Request, res: Response) => {
  try {
    await deleteItem(req.params.id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

app.listen(port, () => {
  console.log(`API: http://localhost:${port}`);
  if (isSupabaseEnabled()) {
    console.log("永続化: Supabase");
  } else {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    console.log("永続化: メモリ（SUPABASE_URL を設定すると Supabase に接続します）");
    if (!url || !key) {
      console.log(
        "  .env 確認: SUPABASE_URL=" + (url ? "あり" : "なし") + ", SUPABASE_ANON_KEY=" + (key ? "あり" : "なし")
      );
      console.log("  api/.env に2行で書く: SUPABASE_URL=... と SUPABASE_ANON_KEY=...");
    }
  }
});
