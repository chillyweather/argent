use chrono::Local;
use reqwest::Client;
use crate::sb::error::SbError;
use crate::commands::save::SaveResult;

pub struct SbClient {
    base_url: String,
    token: String,
    client: Client,
}

impl SbClient {
    pub fn new(base_url: &str, token: &str) -> Self {
        let base_url = base_url.trim_end_matches('/').to_string();
        Self {
            base_url,
            token: token.to_string(),
            client: Client::new(),
        }
    }

    fn normalize_url(&self, url: &str) -> String {
        let url = url.trim_start_matches('/');
        if url.is_empty() {
            self.base_url.clone()
        } else {
            format!("{}/{}", self.base_url, url)
        }
    }

    pub async fn test_connection(&self) -> Result<String, SbError> {
        let url = self.normalize_url("/");
        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await?;

        if response.status().is_success() {
            Ok("Connection successful".to_string())
        } else if response.status() == reqwest::StatusCode::UNAUTHORIZED {
            Err(SbError::AuthFailed)
        } else {
            Err(SbError::ServerError(format!("Status: {}", response.status())))
        }
    }

    fn sanitize_filename(text: &str) -> String {
        let mut result: String = text
            .chars()
            .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' || c == ' ' { c } else { '-' })
            .collect();
        result = result.trim().to_string();
        result = result.replace(' ', "-");
        result = result.to_lowercase();
        while result.contains("--") {
            result = result.replace("--", "-");
        }
        result.trim_matches('-').to_string()
    }

    fn extract_heading(content: &str) -> Option<String> {
        let first_line = content.lines().next()?.trim();
        if let Some(heading) = first_line.strip_prefix("# ") {
            let text = heading.trim();
            if !text.is_empty() {
                let sanitized = Self::sanitize_filename(text);
                if !sanitized.is_empty() {
                    return Some(sanitized);
                }
            }
        }
        None
    }

    pub async fn save_note(&self, content: &str) -> Result<SaveResult, SbError> {
        let now = Local::now();
        let filename = match Self::extract_heading(content) {
            Some(heading) => heading,
            None => now.format("%Y-%m-%d-%H%M%S-%3f").to_string(),
        };
        let path = format!(
            "Inbox/{}/{:02}/{}.md",
            now.format("%Y"),
            now.format("%m"),
            filename
        );

        let url = self.normalize_url(&path);
        
        let response = self.client
            .put(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "text/markdown")
            .body(content.to_string())
            .send()
            .await?;

        if response.status().is_success() {
            Ok(SaveResult {
                path: path.clone(),
                url,
            })
        } else if response.status() == reqwest::StatusCode::UNAUTHORIZED {
            Err(SbError::AuthFailed)
        } else {
            Err(SbError::ServerError(format!("Status: {}", response.status())))
        }
    }
}
