use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use crate::crypto::{decrypt_api_key, encrypt_api_key};

fn get_decrypted_api_key(app: &AppHandle, provider_id: &str) -> Result<String, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let store_path = dir.join("store.json");
    let store = app.store(store_path).map_err(|e| e.to_string())?;

    let providers = store.get("ai_providers").ok_or("No providers found")?;
    let providers_array = providers.as_array().ok_or("Invalid providers format")?;

    for provider in providers_array {
        if let Some(id) = provider.get("id").and_then(|i| i.as_str()) {
            if id == provider_id {
                if let Some(encrypted_key) = provider.get("encryptedApiKey").and_then(|k| k.as_str()) {
                    return decrypt_api_key(encrypted_key);
                }
            }
        }
    }

    Err(format!("API key for provider {} not found", provider_id))
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

        // Decrypt API keys for providers
        if let Some(providers_array) = value.as_array_mut() {
            for provider in providers_array.iter_mut() {
                let Some(provider_obj) = provider.as_object_mut() else {
                    continue;
                };

                if let Some(encrypted_key) = provider_obj.get("encryptedApiKey").and_then(|k| k.as_str()) {
                    if let Ok(decrypted_key) = decrypt_api_key(encrypted_key) {
                        provider_obj.insert("apiKey".to_string(), serde_json::Value::String(decrypted_key));
                    }
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

    // Encrypt API keys and store in JSON
    if let Some(providers_array) = providers.as_array_mut() {
        for provider in providers_array.iter_mut() {
            if let Some(provider_obj) = provider.as_object_mut() {
                if let Some(api_key) = provider_obj.get("apiKey").and_then(|k| k.as_str()) {
                    if !api_key.is_empty() {
                        // Encrypt and store API key
                        let encrypted_key = encrypt_api_key(api_key)?;
                        provider_obj.insert(
                            "encryptedApiKey".to_string(),
                            serde_json::Value::String(encrypted_key),
                        );
                    } else {
                        // Remove encrypted key if api key is empty
                        provider_obj.remove("encryptedApiKey");
                    }
                    // Clear plain text API key from storage
                    provider_obj.insert(
                        "apiKey".to_string(),
                        serde_json::Value::String("".to_string()),
                    );
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

    let api_key = get_decrypted_api_key(&app, provider_id)
        .map_err(|_| format!("API key for provider {} is missing", provider_id))?;

    match provider_id {
        "openai" => crate::ai::openai(model, &task_description, input, &api_key).await,
        "google-gemini" => crate::ai::gemini(model, &task_description, input, &api_key).await,
        "anthropic" => crate::ai::anthropic(model, &task_description, input, &api_key).await,
        _ => Err(format!("Provider {} not supported yet", provider_id)),
    }
}
