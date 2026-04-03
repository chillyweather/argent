use serde::{Deserialize, Serialize};
use crate::sb::client::SbClient;

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentNote {
    pub name: String,
    pub path: String,
    pub url: String,
    pub last_modified: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentNotesResult {
    pub notes: Vec<RecentNote>,
}

#[tauri::command]
pub async fn fetch_recent_notes(
    sb_url: String,
    sb_token: String,
) -> Result<RecentNotesResult, String> {
    if sb_url.is_empty() || sb_token.is_empty() {
        return Ok(RecentNotesResult { notes: vec![] });
    }

    let client = SbClient::new(&sb_url, &sb_token);
    let notes = client.fetch_recent_notes().await.map_err(|e| e.to_string())?;
    Ok(RecentNotesResult { notes })
}
