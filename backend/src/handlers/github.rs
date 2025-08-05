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
                        log::error!("Failed to parse GitHub response: {}", e);
                        Ok(HttpResponse::InternalServerError().json(json!({
                            "error": "Failed to parse GitHub response"
                        })))
                    }
                }
            } else {
                let status = response.status();
                let error_body = response.text().await.unwrap_or_default();
                log::error!("GitHub API error {}: {}", status, error_body);
                
                Ok(HttpResponse::InternalServerError().json(json!({
                    "error": format!("GitHub API error: {}", status)
                })))
            }
        }
        Err(e) => {
            log::error!("Failed to connect to GitHub API: {}", e);
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

// Fetch open GitHub issues
pub async fn get_open_issues() -> Result<HttpResponse> {
    log::info!("🔍 GitHub Issues: Starting to fetch open issues");
    
    let github_token = std::env::var("GITHUB_TOKEN")
        .map_err(|_| {
            log::error!("❌ GITHUB_TOKEN environment variable not set");
            actix_web::error::ErrorInternalServerError("GitHub integration not configured")
        })?;
    
    let github_repo = std::env::var("GITHUB_REPO")
        .unwrap_or_else(|_| "ButterflyEA/treatments_manager".to_string());
    
    log::info!("📋 GitHub repo: {}", github_repo);
    log::info!("🔑 GitHub token configured: {} chars", github_token.len());
    
    // Create HTTP client
    let client = reqwest::Client::new();
    
    // Make request to GitHub API to get open issues
    let url = format!("https://api.github.com/repos/{}/issues?state=open&sort=created&direction=desc&per_page=20", github_repo);
    log::info!("🌐 GitHub API URL: {}", url);
    log::info!("🌐 GitHub API URL: {}", url);
    
    log::info!("🚀 Sending request to GitHub API...");
    match client
        .get(&url)
        .header("Authorization", format!("token {}", github_token))
        .header("Accept", "application/vnd.github.v3+json")
        .header("User-Agent", "TreatmentManager/1.0")
        .send()
        .await
    {
        Ok(response) => {
            let status = response.status();
            log::info!("📨 GitHub API response status: {}", status);
            
            if response.status().is_success() {
                log::info!("✅ GitHub API request successful, parsing JSON...");
                match response.json::<serde_json::Value>().await {
                    Ok(issues) => {
                        log::info!("✅ JSON parsing successful");
                        log::info!("📊 Raw issues data type: {}", if issues.is_array() { "array" } else { "other" });
                        
                        // Filter and format the issues data
                        let formatted_issues = if let Some(issues_array) = issues.as_array() {
                            log::info!("📈 Found {} issues in response", issues_array.len());
                            issues_array.iter().enumerate().map(|(i, issue)| {
                                log::debug!("Processing issue {}: #{} - {}", 
                                    i + 1, 
                                    issue["number"].as_u64().unwrap_or(0),
                                    issue["title"].as_str().unwrap_or("No title")
                                );
                                json!({
                                    "number": issue["number"],
                                    "title": issue["title"],
                                    "body": issue["body"],
                                    "state": issue["state"],
                                    "html_url": issue["html_url"],
                                    "created_at": issue["created_at"],
                                    "updated_at": issue["updated_at"],
                                    "labels": issue["labels"].as_array().unwrap_or(&vec![]).iter().map(|label| {
                                        json!({
                                            "name": label["name"],
                                            "color": label["color"]
                                        })
                                    }).collect::<Vec<_>>(),
                                    "user": {
                                        "login": issue["user"]["login"],
                                        "avatar_url": issue["user"]["avatar_url"]
                                    }
                                })
                            }).collect::<Vec<_>>()
                        } else {
                            log::warn!("⚠️  GitHub API response is not an array");
                            vec![]
                        };
                        
                        log::info!("📋 Successfully formatted {} issues", formatted_issues.len());
                        Ok(HttpResponse::Ok().json(json!({
                            "issues": formatted_issues,
                            "repository": github_repo
                        })))
                    }
                    Err(e) => {
                        log::error!("❌ Failed to parse GitHub issues response: {}", e);
                        Ok(HttpResponse::InternalServerError().json(json!({
                            "error": "Failed to parse GitHub response"
                        })))
                    }
                }
            } else {
                let status = response.status();
                let error_body = response.text().await.unwrap_or_default();
                log::error!("❌ GitHub API error {}: {}", status, error_body);
                
                Ok(HttpResponse::InternalServerError().json(json!({
                    "error": format!("GitHub API error: {}", status)
                })))
            }
        }
        Err(e) => {
            log::error!("❌ Failed to connect to GitHub API: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Failed to connect to GitHub API"
            })))
        }
    }
}
