use serde::{Deserialize, Serialize};
use crate::sb::client::SbClient;
use crate::sb::error::SbError;

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
) -> Result<RecentNotesResult, SbError> {
    if sb_url.is_empty() || sb_token.is_empty() {
        return Ok(RecentNotesResult { notes: vec![] });
    }

    let client = SbClient::new(&sb_url, &sb_token);
    let notes = client.fetch_recent_notes().await?;
    Ok(RecentNotesResult { notes })
}
