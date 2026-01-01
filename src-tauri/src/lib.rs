// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;
mod ai;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::my_custom_command,
            commands::greet,
            commands::load_tasks,
            commands::save_tasks,
            commands::load_ai_providers,
            commands::save_ai_providers,
            commands::execute_task,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
