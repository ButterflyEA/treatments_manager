use actix_web::{web, HttpResponse, Result};
use bcrypt::{hash, verify, DEFAULT_COST};
use uuid::Uuid;
use chrono::Utc;
use crate::{
    database::Database,
    models::{LoginRequest, LoginResponse, User, UserInfo, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest},
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

// Get all users (admin function)
pub async fn get_users(
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    match sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, name, created_at FROM users ORDER BY name",
    )
    .fetch_all(db.pool())
    .await
    {
        Ok(users) => {
            let user_infos: Vec<UserInfo> = users.into_iter().map(UserInfo::from).collect();
            Ok(HttpResponse::Ok().json(user_infos))
        }
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to fetch users"
        }))),
    }
}

// Create a new user
pub async fn create_user(
    db: web::Data<Database>,
    user_data: web::Json<CreateUserRequest>,
) -> Result<HttpResponse> {
    // Check if user already exists
    let existing_user = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE email = ?",
    )
    .bind(&user_data.email)
    .fetch_one(db.pool())
    .await;

    match existing_user {
        Ok(count) if count > 0 => {
            return Ok(HttpResponse::Conflict().json(serde_json::json!({
                "error": "User with this email already exists"
            })));
        }
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database error"
            })));
        }
        _ => {}
    }

    // Hash password
    let password_hash = match hash(&user_data.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to hash password"
            })));
        }
    };

    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now();

    match sqlx::query(
        "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&user_id)
    .bind(&user_data.email)
    .bind(&password_hash)
    .bind(&user_data.name)
    .bind(now)
    .execute(db.pool())
    .await
    {
        Ok(_) => {
            let user_info = UserInfo {
                id: user_id,
                email: user_data.email.clone(),
                name: user_data.name.clone(),
            };
            Ok(HttpResponse::Created().json(user_info))
        }
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to create user"
        }))),
    }
}

// Update user details (not password)
pub async fn update_user(
    db: web::Data<Database>,
    user_id: web::Path<String>,
    user_data: web::Json<UpdateUserRequest>,
) -> Result<HttpResponse> {
    // First check if user exists
    let existing_user = match sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, name, created_at FROM users WHERE id = ?",
    )
    .bind(user_id.as_str())
    .fetch_optional(db.pool())
    .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": "User not found"
            })));
        }
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database error"
            })));
        }
    };

    let mut updated_email = existing_user.email.clone();
    let mut updated_name = existing_user.name.clone();
    let mut changes_made = false;

    // Check email update
    if let Some(email) = &user_data.email {
        if email != &existing_user.email {
            // Check if email is already taken by another user
            let email_check = sqlx::query_scalar::<_, i64>(
                "SELECT COUNT(*) FROM users WHERE email = ? AND id != ?",
            )
            .bind(email)
            .bind(user_id.as_str())
            .fetch_one(db.pool())
            .await;

            match email_check {
                Ok(count) if count > 0 => {
                    return Ok(HttpResponse::Conflict().json(serde_json::json!({
                        "error": "Email already taken by another user"
                    })));
                }
                Err(_) => {
                    return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Database error"
                    })));
                }
                _ => {
                    updated_email = email.clone();
                    changes_made = true;
                }
            }
        }
    }

    // Check name update
    if let Some(name) = &user_data.name {
        if name != &existing_user.name {
            updated_name = name.clone();
            changes_made = true;
        }
    }

    if !changes_made {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "No fields to update"
        })));
    }

    // Update the user
    match sqlx::query("UPDATE users SET email = ?, name = ? WHERE id = ?")
        .bind(&updated_email)
        .bind(&updated_name)
        .bind(user_id.as_str())
        .execute(db.pool())
        .await
    {
        Ok(_) => {
            let user_info = UserInfo {
                id: existing_user.id,
                email: updated_email,
                name: updated_name,
            };
            Ok(HttpResponse::Ok().json(user_info))
        }
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to update user"
        }))),
    }
}

// Change user password
pub async fn change_password(
    db: web::Data<Database>,
    user_id: web::Path<String>,
    password_data: web::Json<ChangePasswordRequest>,
) -> Result<HttpResponse> {
    // Get current user
    let user = match sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, name, created_at FROM users WHERE id = ?",
    )
    .bind(user_id.as_str())
    .fetch_optional(db.pool())
    .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Ok(HttpResponse::NotFound().json(serde_json::json!({
                "error": "User not found"
            })));
        }
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database error"
            })));
        }
    };

    // Verify current password
    if !verify(&password_data.current_password, &user.password_hash).unwrap_or(false) {
        return Ok(HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Current password is incorrect"
        })));
    }

    // Hash new password
    let new_password_hash = match hash(&password_data.new_password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to hash new password"
            })));
        }
    };

    // Update password
    match sqlx::query("UPDATE users SET password_hash = ? WHERE id = ?")
        .bind(&new_password_hash)
        .bind(user_id.as_str())
        .execute(db.pool())
        .await
    {
        Ok(_) => Ok(HttpResponse::Ok().json(serde_json::json!({
            "message": "Password updated successfully"
        }))),
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to update password"
        }))),
    }
}

// Delete user
pub async fn delete_user(
    db: web::Data<Database>,
    user_id: web::Path<String>,
) -> Result<HttpResponse> {
    match sqlx::query("DELETE FROM users WHERE id = ?")
        .bind(user_id.as_str())
        .execute(db.pool())
        .await
    {
        Ok(result) => {
            if result.rows_affected() == 0 {
                Ok(HttpResponse::NotFound().json(serde_json::json!({
                    "error": "User not found"
                })))
            } else {
                Ok(HttpResponse::Ok().json(serde_json::json!({
                    "message": "User deleted successfully"
                })))
            }
        }
        Err(_) => Ok(HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to delete user"
        }))),
    }
}
