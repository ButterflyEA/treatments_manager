use actix_web::{web, HttpResponse, Result};
use serde_json::json;
use crate::models::{CreateIssueRequest, GitHubIssueRequest, GitHubIssueResponse, CreateIssueResponse};

pub async fn create_issue(
    issue_data: web::Json<CreateIssueRequest>,
) -> Result<HttpResponse> {
    // Get GitHub configuration from environment variables
    let github_token = std::env::var("GITHUB_TOKEN")
        .map_err(|_| {
            log::error!("GITHUB_TOKEN environment variable not set");
            actix_web::error::ErrorInternalServerError("GitHub integration not configured")
        })?;
    
    let github_repo = std::env::var("GITHUB_REPO")
        .unwrap_or_else(|_| "ButterflyEA/treatments_manager".to_string());
    
    // Build the issue body with metadata
    let issue_body = format!(
        "{}\n\n---\n\n**Issue Details:**\n- Type: {}\n- Priority: {}\n- Reported via: Treatment Manager System",
        issue_data.description,
        issue_data.issue_type,
        issue_data.priority
    );
    
    // Create labels based on issue type and priority
    let mut labels = vec![
        format!("type:{}", issue_data.issue_type),
        format!("priority:{}", issue_data.priority),
        "user-reported".to_string(),
    ];
    
    // Add specific labels for different types
    match issue_data.issue_type.as_str() {
        "bug" => labels.push("bug".to_string()),
        "feature" => labels.push("enhancement".to_string()),
        "enhancement" => labels.push("enhancement".to_string()),
        _ => {}
    }
    
    let github_issue = GitHubIssueRequest {
        title: issue_data.title.clone(),
        body: issue_body,
        labels,
    };
    
    // Create HTTP client
    let client = reqwest::Client::new();
    
    // Make request to GitHub API
    let url = format!("https://api.github.com/repos/{github_repo}/issues");
    
    match client
        .post(&url)
        .header("Authorization", format!("token {github_token}"))
        .header("Accept", "application/vnd.github.v3+json")
        .header("User-Agent", "TreatmentManager/1.0")
        .json(&github_issue)
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<GitHubIssueResponse>().await {
                    Ok(github_response) => {
                        let response = CreateIssueResponse {
                            success: true,
                            message: "Issue created successfully".to_string(),
                            html_url: Some(github_response.html_url),
                            issue_number: Some(github_response.number),
                        };
                        Ok(HttpResponse::Created().json(response))
                    }
                    Err(e) => {
                        log::error!("Failed to parse GitHub response: {e}");
                        Ok(HttpResponse::InternalServerError().json(json!({
                            "error": "Failed to parse GitHub response"
                        })))
                    }
                }
            } else {
                let status = response.status();
                let error_body = response.text().await.unwrap_or_default();
                log::error!("GitHub API error {status}: {error_body}");
                
                Ok(HttpResponse::InternalServerError().json(json!({
                    "error": format!("GitHub API error: {status}")
                })))
            }
        }
        Err(e) => {
            log::error!("Failed to connect to GitHub API: {e}");
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Failed to connect to GitHub API"
            })))
        }
    }
}

// Health check endpoint to verify GitHub integration
pub async fn github_health() -> Result<HttpResponse> {
    let github_token = std::env::var("GITHUB_TOKEN");
    let github_repo = std::env::var("GITHUB_REPO")
        .unwrap_or_else(|_| "ButterflyEA/treatments_manager".to_string());
    
    let status = if github_token.is_ok() {
        json!({
            "github_integration": "configured",
            "repository": github_repo,
            "status": "ready"
        })
    } else {
        json!({
            "github_integration": "not_configured",
            "repository": github_repo,
            "status": "missing_token",
            "message": "Set GITHUB_TOKEN environment variable to enable issue creation"
        })
    };
    
    Ok(HttpResponse::Ok().json(status))
}
