use tauri::{AppHandle, Manager};
use tauri_plugin_log::log;
use tauri_plugin_store::StoreExt;

fn get_api_key_from_keyring(provider_id: &str) -> Result<String, String> {
    let service_name = format!("GrammarNoJutsu-{}", provider_id);
    let entry = keyring::Entry::new(&service_name, provider_id).map_err(|e| e.to_string())?;
    entry.get_password().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn my_custom_command() {
    println!("I was invoked from JavaScript!");
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn load_tasks(app: AppHandle) -> Result<serde_json::Value, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let store_path = dir.join("store.json");

    let store = app.store(store_path).map_err(|e| e.to_string())?;

    let value = store.get("tasks").ok_or("No tasks found".to_string())?;

    Ok(value)
}

#[tauri::command]
pub fn save_tasks(app: AppHandle, tasks: serde_json::Value) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let store_path = dir.join("store.json");

    let store = app.store(store_path).map_err(|e| e.to_string())?;

    store.set("tasks", tasks);

    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn load_ai_providers(app: AppHandle) -> Result<serde_json::Value, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let store_path = dir.join("store.json");

    let store = app.store(store_path).map_err(|e| e.to_string())?;

    // If no providers exist, create default ones
    if store.get("ai_providers").is_none() {
        let default_providers = serde_json::json!([
            {
                "id": "openai",
                "name": "OpenAI",
                "enabled": true,
                "apiKey": "",
                "apiKeyUrl": "https://platform.openai.com/api-keys"
            },
            {
                "id": "google-gemini",
                "name": "Google Gemini",
                "enabled": true,
                "apiKey": "",
                "apiKeyUrl": "https://aistudio.google.com/app/apikey"
            },
            {
                "id": "anthropic",
                "name": "Anthropic Claude",
                "enabled": true,
                "apiKey": "",
                "apiKeyUrl": "https://console.anthropic.com/settings/keys"
            }
        ]);

        store.set("ai_providers", default_providers.clone());
        store.save().map_err(|e| e.to_string())?;
        Ok(default_providers)
    } else {
        let mut value = store
            .get("ai_providers")
            .ok_or("No providers found".to_string())?;

        // Load API keys from keyring for providers with empty keys
        if let Some(providers_array) = value.as_array_mut() {
            for provider in providers_array.iter_mut() {
                let Some(provider_obj) = provider.as_object_mut() else {
                    continue;
                };
                let Some(api_key) = provider_obj.get("apiKey").and_then(|k| k.as_str()) else {
                    continue;
                };
                let Some(id) = provider_obj.get("id").and_then(|i| i.as_str()) else {
                    continue;
                };

                if !api_key.is_empty() {
                    continue;
                };

                if let Ok(stored_key) = get_api_key_from_keyring(id) {
                    provider_obj
                        .insert("apiKey".to_string(), serde_json::Value::String(stored_key));
                }
            }
        }

        Ok(value)
    }
}

#[tauri::command]
pub fn save_ai_providers(app: AppHandle, mut providers: serde_json::Value) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    let store_path = dir.join("store.json");

    let store = app.store(store_path).map_err(|e| e.to_string())?;

    // Store API keys in keyring and remove from JSON for security
    if let Some(providers_array) = providers.as_array_mut() {
        for provider in providers_array.iter_mut() {
            if let Some(provider_obj) = provider.as_object_mut() {
                if let Some(id) = provider_obj.get("id").and_then(|i| i.as_str()) {
                    if let Some(api_key) = provider_obj.get("apiKey").and_then(|k| k.as_str()) {
                        let service_name = format!("GrammarNoJutsu-{}", id);
                        let entry =
                            keyring::Entry::new(&service_name, id).map_err(|e| e.to_string())?;

                        if !api_key.is_empty() {
                            // Store non-empty API key in keyring
                            entry.set_password(api_key).map_err(|e| e.to_string())?;
                            // Clear from JSON for security
                            provider_obj.insert(
                                "apiKey".to_string(),
                                serde_json::Value::String("".to_string()),
                            );
                        } else {
                            // Remove empty API key from keyring
                            let _ = entry.delete_credential();
                        }
                    }
                }
            }
        }
    }

    store.set("ai_providers", providers);
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn execute_task(
    app: AppHandle,
    task_id: &str,
    provider_id: &str,
    model: &str,
    input: &str,
) -> Result<serde_json::Value, String> {
    let tasks_json = load_tasks(app.clone())?;
    let tasks = tasks_json.as_array().ok_or("Tasks not found")?;
    let task = tasks
        .iter()
        .find(|t| t.get("id").and_then(|id| id.as_str()) == Some(task_id))
        .ok_or_else(|| format!("Task {} not found", task_id))?;

    let task_description = task
        .get("taskDescription")
        .and_then(|s| s.as_str())
        .unwrap_or("")
        .to_string() + "\n\n!Important: Output only the text of the response, do not include any additional information or formatting.";

    let api_key = get_api_key_from_keyring(provider_id)
        .map_err(|_| format!("API key for provider {} is missing", provider_id))?;

    match provider_id {
        "openai" => crate::ai::openai(model, &task_description, input, &api_key).await,
        "google-gemini" => crate::ai::gemini(model, &task_description, input, &api_key).await,
        _ => Err(format!("Provider {} not supported yet", provider_id)),
    }
}
