use serde::Serialize;

#[derive(Debug, thiserror::Error, Serialize)]
pub enum SbError {
    #[error("Network error: {0}")]
    Network(String),
    #[error("Authentication failed")]
    AuthFailed,
    #[error("Server error: {0}")]
    ServerError(String),
    #[error("Not found")]
    NotFound,
    #[error("Configuration missing: {0}")]
    ConfigMissing(String),
}

impl From<reqwest::Error> for SbError {
    fn from(err: reqwest::Error) -> Self {
        if let Some(status) = err.status() {
            if status == reqwest::StatusCode::UNAUTHORIZED {
                return SbError::AuthFailed;
            } else if status == reqwest::StatusCode::NOT_FOUND {
                return SbError::NotFound;
            }
        }
        SbError::Network(err.to_string())
    }
}
