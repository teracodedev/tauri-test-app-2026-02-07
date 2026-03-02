// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::time::Duration;

const API_BASE: &str = "http://localhost:3000";

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Item {
    id: String,
    title: String,
    description: String,
}

fn api_client() -> reqwest::Client {
    reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .expect("HTTP client")
}

fn api_error(e: reqwest::Error, context: &str) -> String {
    if e.is_connect() || e.is_timeout() {
        format!(
            "API サーバーに接続できません。\n\
            「cd api && npm run dev」で API を起動してから再度お試しください。\n\
            （{}）",
            context
        )
    } else if let Some(status) = e.status() {
        format!("API エラー {}: {}", status, context)
    } else {
        format!("{}: {}", context, e)
    }
}

#[tauri::command]
async fn create_item(title: String, description: String) -> Result<Item, String> {
    #[cfg(debug_assertions)]
    eprintln!("[create_item] title={:?} description={:?}", title, description);
    let body = serde_json::json!({ "title": title, "description": description });
    let res = api_client()
        .post(format!("{}/api/items", API_BASE))
        .json(&body)
        .send()
        .await
        .map_err(|e| api_error(e, "create_item"))?;
    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        return Err(format!("API エラー {}: {}", status, text));
    }
    let item: Item = res.json().await.map_err(|e| e.to_string())?;
    Ok(item)
}

#[tauri::command]
async fn list_items() -> Result<Vec<Item>, String> {
    let res = api_client()
        .get(format!("{}/api/items", API_BASE))
        .send()
        .await
        .map_err(|e| api_error(e, "list_items"))?;
    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        return Err(format!("API エラー {}: {}", status, text));
    }
    let items: Vec<Item> = res.json().await.map_err(|e| e.to_string())?;
    Ok(items)
}

#[tauri::command]
async fn get_item(id: String) -> Result<Option<Item>, String> {
    let res = api_client()
        .get(format!("{}/api/items/{}", API_BASE, id))
        .send()
        .await
        .map_err(|e| api_error(e, "get_item"))?;
    if res.status() == reqwest::StatusCode::NOT_FOUND {
        return Ok(None);
    }
    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        return Err(format!("API エラー {}: {}", status, text));
    }
    let item: Item = res.json().await.map_err(|e| e.to_string())?;
    Ok(Some(item))
}

#[tauri::command]
async fn update_item(id: String, title: String, description: String) -> Result<Item, String> {
    #[cfg(debug_assertions)]
    eprintln!("[update_item] id={} title={:?} description={:?}", id, title, description);
    let body = serde_json::json!({ "title": title, "description": description });
    let res = api_client()
        .put(format!("{}/api/items/{}", API_BASE, id))
        .json(&body)
        .send()
        .await
        .map_err(|e| api_error(e, "update_item"))?;
    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        return Err(format!("API エラー {}: {}", status, text));
    }
    let item: Item = res.json().await.map_err(|e| e.to_string())?;
    Ok(item)
}

#[tauri::command]
async fn delete_item(id: String) -> Result<(), String> {
    #[cfg(debug_assertions)]
    eprintln!("[delete_item] id={}", id);
    let res = api_client()
        .delete(format!("{}/api/items/{}", API_BASE, id))
        .send()
        .await
        .map_err(|e| api_error(e, "delete_item"))?;
    if !res.status().is_success() && res.status() != reqwest::StatusCode::NO_CONTENT {
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        return Err(format!("API エラー {}: {}", status, text));
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_item,
            list_items,
            get_item,
            update_item,
            delete_item,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}
