use actix_web::{web, HttpResponse, Result};
use bcrypt::{hash, verify, DEFAULT_COST};
use uuid::Uuid;
use chrono::Utc;
use crate::{
    database::Database,
    models::{LoginRequest, LoginResponse, User, UserInfo},
    auth::JwtUtils,
};

pub async fn login(
    db: web::Data<Database>,
    login_data: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    // Check if user exists
    let user_result = sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?",
    )
    .bind(&login_data.email)
    .fetch_optional(db.pool())
    .await;

    match user_result {
        Ok(Some(user)) => {
            // Verify password
            if verify(&login_data.password, &user.password_hash).unwrap_or(false) {
                // Create JWT token
                match JwtUtils::create_token(&user.id, &user.email) {
                    Ok(token) => {
                        let response = LoginResponse {
                            token,
                            user: UserInfo {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                            },
                        };
                        Ok(HttpResponse::Ok().json(response))
                    }
                    Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Failed to create token"
                    }))),
                }
            } else {
                Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Invalid credentials"
                })))
            }
        }
        Ok(None) => Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Invalid credentials"
        }))),
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Database error"
        }))),
    }
}

pub async fn verify_token(
    token: web::Path<String>,
) -> Result<HttpResponse> {
    match JwtUtils::verify_token(&token) {
        Ok(claims) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "valid": true,
            "user_id": claims.sub,
            "email": claims.email
        }))),
        Err(_) => Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "valid": false,
            "error": "Invalid token"
        }))),
    }
}

// Function to create a default user (run this once)
pub async fn create_default_user(db: &Database) -> Result<(), sqlx::Error> {
    let default_email = "admin@treatments.com";
    let default_password = "admin123";
    let default_name = "Treatment Administrator";

    // Check if user already exists
    let existing_user = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE email = ?",
    )
    .bind(default_email)
    .fetch_one(db.pool())
    .await?;

    if existing_user == 0 {
        let password_hash = hash(default_password, DEFAULT_COST).unwrap();
        let user_id = Uuid::new_v4().to_string();  // Convert to string for SQLite
        let now = Utc::now();

        sqlx::query(
            "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(user_id)
        .bind(default_email)
        .bind(password_hash)
        .bind(default_name)
        .bind(now)
        .execute(db.pool())
        .await?;

        println!("✅ Default user created:");
        println!("   Email: {}", default_email);
        println!("   Password: {}", default_password);
    }

    Ok(())
}
