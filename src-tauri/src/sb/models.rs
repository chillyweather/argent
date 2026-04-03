use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryRequest {
    pub query: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResponse {
    pub result: Vec<PageInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PageInfo {
    pub name: String,
    #[serde(rename = "lastModified")]
    pub last_modified: i64,
}
