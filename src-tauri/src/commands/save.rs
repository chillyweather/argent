use serde::{Deserialize, Serialize};
use crate::sb::client::SbClient;
use crate::sb::error::SbError;

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
) -> Result<SaveResult, SbError> {
    if sb_url.is_empty() {
        return Err(SbError::ConfigMissing("SilverBullet URL is not configured".into()));
    }
    if sb_token.is_empty() {
        return Err(SbError::ConfigMissing("SilverBullet token is not configured".into()));
    }

    let client = SbClient::new(&sb_url, &sb_token);
    client.save_note(&content).await
}

#[tauri::command]
pub async fn test_connection(
    sb_url: String,
    sb_token: String,
) -> Result<String, SbError> {
    if sb_url.is_empty() {
        return Err(SbError::ConfigMissing("SilverBullet URL is not configured".into()));
    }
    if sb_token.is_empty() {
        return Err(SbError::ConfigMissing("SilverBullet token is not configured".into()));
    }

    let client = SbClient::new(&sb_url, &sb_token);
    client.test_connection().await
}
