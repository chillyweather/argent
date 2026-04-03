use serde::{Deserialize, Serialize};
use crate::sb::client::SbClient;

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveResult {
    pub path: String,
    pub url: String,
}

#[tauri::command]
pub async fn save_to_sb(
    content: String,
    sb_url: String,
    sb_token: String,
) -> Result<SaveResult, String> {
    if sb_url.is_empty() {
        return Err("SilverBullet URL is not configured".to_string());
    }
    if sb_token.is_empty() {
        return Err("SilverBullet token is not configured".to_string());
    }

    let client = SbClient::new(&sb_url, &sb_token);
    client.save_note(&content).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn test_connection(
    sb_url: String,
    sb_token: String,
) -> Result<String, String> {
    if sb_url.is_empty() {
        return Err("SilverBullet URL is not configured".to_string());
    }
    if sb_token.is_empty() {
        return Err("SilverBullet token is not configured".to_string());
    }

    let client = SbClient::new(&sb_url, &sb_token);
    client.test_connection().await.map_err(|e| e.to_string())
}
