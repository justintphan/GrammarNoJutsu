use tauri_plugin_http::reqwest;

pub async fn openai(
    model: &str,
    instructions: &str,
    input: &str,
    api_key: &str,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        "Authorization",
        format!("Bearer {}", api_key).parse().unwrap(),
    );
    headers.insert("Content-Type", "application/json".parse().unwrap());

    let mut body = serde_json::json!({
        "model": model,
        "input": input,
    });

    if !instructions.is_empty() {
        if let Some(obj) = body.as_object_mut() {            
            obj.insert("instructions".to_string(), serde_json::json!(instructions));
        }
    }

    let res = client
        .post("https://api.openai.com/v1/responses")
        .headers(headers)
        .body(serde_json::to_string(&body).map_err(|e| e.to_string())?)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let error_text = res
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error: {}", error_text));
    }

    if !res.status().is_success() {
        let error_text = res
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error: {}", error_text));
    }

    let text = res.text().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    let content = json
        .get("output")
        .and_then(|c| c.get(0))
        .and_then(|c| c.get("content"))
        .and_then(|c| c.get(0))
        .and_then(|c| c.get("text"))
        .and_then(|c| c.as_str())
         .ok_or("Failed to extract content from response")?;

    Ok(serde_json::json!({
        "content": content
    }))
}

pub async fn gemini(
    model: &str,
    instructions: &str,
    input: &str,
    api_key: &str,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert(
        "x-goog-api-key",
        api_key.to_string().parse().unwrap(),
    );
    headers.insert("Content-Type", "application/json".parse().unwrap());

    let prompt = if !instructions.is_empty() {
        format!("{}\n\n{}", instructions, input) 
    } else {
        input.to_string()
    };

    let body = serde_json::json!({
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    });

    let res = client
        .post(format!("https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent", model))
        .headers(headers)
        .body(serde_json::to_string(&body).map_err(|e| e.to_string())?)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let error_text = res
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error: {}", error_text));
    }

    if !res.status().is_success() {
        let error_text = res
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error: {}", error_text));
    }

    let text = res.text().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    let content = json
        .get("candidates")
        .and_then(|c| c.get(0))
        .and_then(|c| c.get("content"))
        .and_then(|c| c.get(0))
        .and_then(|c| c.get("parts"))
        .and_then(|c| c.get(0))
        .and_then(|c| c.get("text"))
        .and_then(|c| c.as_str())
         .ok_or("Failed to extract content from response")?;

    Ok(serde_json::json!({
        "content": content
    }))
}

