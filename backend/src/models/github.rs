use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateIssueRequest {
    pub title: String,
    pub description: String,
    #[serde(rename = "type")]
    pub issue_type: String, // bug, feature, enhancement
    pub priority: String,   // low, medium, high
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubIssueRequest {
    pub title: String,
    pub body: String,
    pub labels: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubIssueResponse {
    pub id: u64,
    pub number: u32,
    pub title: String,
    pub body: Option<String>,
    pub html_url: String,
    pub state: String,
    pub labels: Vec<GitHubLabel>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubLabel {
    pub id: u64,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateIssueResponse {
    pub success: bool,
    pub message: String,
    pub html_url: Option<String>,
    pub issue_number: Option<u32>,
}
