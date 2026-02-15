// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Item {
    id: String,
    title: String,
    description: String,
}

struct AppState {
    items: Mutex<Vec<Item>>,
    next_id: Mutex<u64>,
}

#[tauri::command]
fn create_item(state: State<AppState>, title: String, description: String) -> Result<Item, String> {
    #[cfg(debug_assertions)]
    eprintln!("[create_item] title={:?} description={:?}", title, description);
    let mut next = state.next_id.lock().map_err(|e| e.to_string())?;
    let id = (*next).to_string();
    *next += 1;
    let item = Item {
        id: id.clone(),
        title: title.clone(),
        description: description.clone(),
    };
    state
        .items
        .lock()
        .map_err(|e| e.to_string())?
        .push(item.clone());
    Ok(item)
}

#[tauri::command]
fn list_items(state: State<AppState>) -> Result<Vec<Item>, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;
    Ok(items.clone())
}

#[tauri::command]
fn get_item(state: State<AppState>, id: String) -> Result<Option<Item>, String> {
    let items = state.items.lock().map_err(|e| e.to_string())?;
    Ok(items.iter().find(|i| i.id == id).cloned())
}

#[tauri::command]
fn update_item(
    state: State<AppState>,
    id: String,
    title: String,
    description: String,
) -> Result<Item, String> {
    #[cfg(debug_assertions)]
    eprintln!("[update_item] id={} title={:?} description={:?}", id, title, description);
    let mut items = state.items.lock().map_err(|e| e.to_string())?;
    let pos = items.iter().position(|i| i.id == id);
    match pos {
        Some(idx) => {
            let item = Item {
                id: id.clone(),
                title,
                description,
            };
            items[idx] = item.clone();
            Ok(item)
        }
        None => Err(format!("ID {} の項目が見つかりません", id)),
    }
}

#[tauri::command]
fn delete_item(state: State<AppState>, id: String) -> Result<(), String> {
    #[cfg(debug_assertions)]
    eprintln!("[delete_item] id={}", id);
    let mut items = state.items.lock().map_err(|e| e.to_string())?;
    let pos = items.iter().position(|i| i.id == id);
    match pos {
        Some(idx) => {
            items.remove(idx);
            Ok(())
        }
        None => Err(format!("ID {} の項目が見つかりません", id)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            items: Mutex::new(Vec::new()),
            next_id: Mutex::new(1),
        })
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
