use thiserror::Error;

#[derive(Error, Debug)]
pub enum SbError {
    #[error("Network error: {0}")]
    Network(String),

    #[error("Authentication failed")]
    AuthFailed,

    #[error("Server error: {0}")]
    ServerError(String),

    #[error("Not found")]
    NotFound,
}

impl From<reqwest::Error> for SbError {
    fn from(err: reqwest::Error) -> Self {
        if err.status() == Some(reqwest::StatusCode::UNAUTHORIZED) {
            SbError::AuthFailed
        } else if err.status() == Some(reqwest::StatusCode::NOT_FOUND) {
            SbError::NotFound
        } else {
            SbError::Network(err.to_string())
        }
    }
}
