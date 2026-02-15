import { invoke } from "@tauri-apps/api/core";
import "./style.css";

interface Item {
  id: string;
  title: string;
  description: string;
}

const app = document.querySelector<HTMLDivElement>("#app")!;

function renderList(items: Item[], editingId: string | null) {
  const tbody = app.querySelector("tbody")!;
  tbody.innerHTML = items
    .map(
      (item) => `
    <tr data-id="${item.id}">
      <td>${item.id}</td>
      <td>${editingId === item.id ? `<input type="text" id="edit-title" value="${escapeHtml(item.title)}" />` : escapeHtml(item.title)}</td>
      <td>${editingId === item.id ? `<input type="text" id="edit-desc" value="${escapeHtml(item.description)}" />` : escapeHtml(item.description)}</td>
      <td>
        ${editingId === item.id ? `<button type="button" class="btn-save">保存</button> <button type="button" class="btn-cancel">キャンセル</button>` : `<button type="button" class="btn-edit">編集</button> <button type="button" class="btn-delete">削除</button>`}
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = (btn.closest("tr") as HTMLElement).dataset.id!;
      try {
        await invoke("delete_item", { id });
        await refreshList();
      } catch (e) {
        console.error("[delete_item]", e);
        alert(String(e));
      }
    });
  });

  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn.closest("tr") as HTMLElement).dataset.id!;
      renderList(items, id);
      bindEditSaveCancel(id);
    });
  });

  if (editingId) {
    bindEditSaveCancel(editingId);
  }
}

function bindEditSaveCancel(id: string) {
  const saveBtn = app.querySelector(".btn-save");
  const cancelBtn = app.querySelector(".btn-cancel");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const title = (app.querySelector("#edit-title") as HTMLInputElement).value;
      const description = (app.querySelector("#edit-desc") as HTMLInputElement).value;
      try {
        await invoke("update_item", { id, title, description });
        await refreshList();
      } catch (e) {
        console.error("[update_item]", e);
        alert(String(e));
      }
    }, { once: true });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => refreshList(), { once: true });
  }
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

async function refreshList() {
  try {
    const items = (await invoke("list_items")) as Item[];
    renderList(items, null);
  } catch (e) {
    console.error("[list_items]", e);
    document.getElementById("error")!.textContent = "一覧の取得に失敗しました: " + String(e);
  }
}

app.innerHTML = `
  <div class="container">
    <h1>CRUD アプリ（Tauri 2.0）</h1>
    <section class="form">
      <h2>新規追加</h2>
      <p>
        <label>タイトル <input type="text" id="new-title" placeholder="タイトル" /></label>
      </p>
      <p>
        <label>説明 <input type="text" id="new-desc" placeholder="説明" /></label>
      </p>
      <p><button type="button" id="btn-create">追加</button></p>
    </section>
    <section class="list">
      <h2>一覧</h2>
      <table>
        <thead><tr><th>ID</th><th>タイトル</th><th>説明</th><th>操作</th></tr></thead>
        <tbody></tbody>
      </table>
    </section>
    <p class="error" id="error"></p>
  </div>
`;

document.getElementById("btn-create")!.addEventListener("click", async () => {
  const title = (document.getElementById("new-title") as HTMLInputElement).value.trim();
  const desc = (document.getElementById("new-desc") as HTMLInputElement).value.trim();
  if (!title) {
    document.getElementById("error")!.textContent = "タイトルを入力してください。";
    return;
  }
  document.getElementById("error")!.textContent = "";
  try {
    await invoke("create_item", { title, description: desc });
    (document.getElementById("new-title") as HTMLInputElement).value = "";
    (document.getElementById("new-desc") as HTMLInputElement).value = "";
    await refreshList();
  } catch (e) {
    console.error("[create_item]", e);
    document.getElementById("error")!.textContent = String(e);
  }
});

refreshList();
