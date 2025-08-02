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
    log::info!("Login attempt for email: {}", login_data.email);
    
    // Check if user exists
    let user_result = sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?",
    )
    .bind(&login_data.email)
    .fetch_optional(db.pool())
    .await;

    match user_result {
        Ok(Some(user)) => {
            log::info!("User found in database: {}", user.email);
            log::info!("Input password length: {}", login_data.password.len());
            log::info!("Stored hash starts with: {}", &user.password_hash[..20]); // Just first 20 chars for debugging
            
            // Verify password
            let password_matches = verify(&login_data.password, &user.password_hash).unwrap_or(false);
            log::info!("Password verification result: {}", password_matches);
            
            if password_matches {
                log::info!("Password verification successful for user: {}", user.email);
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
                log::warn!("Password verification failed for user: {}", user.email);
                log::warn!("Input password had {} characters", login_data.password.len());
                log::warn!("Hash verification returned false");
                
                // Additional debugging - check if password contains unusual characters
                let has_non_ascii = !login_data.password.is_ascii();
                let has_whitespace = login_data.password.chars().any(|c| c.is_whitespace());
                log::warn!("Password contains non-ASCII chars: {}, whitespace: {}", has_non_ascii, has_whitespace);
                
                Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Invalid credentials"
                })))
            }
        }
        Ok(None) => {
            log::warn!("User not found: {}", login_data.email);
            Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Invalid credentials"
            })))
        }
        Err(e) => {
            log::error!("Database error during login: {e}");
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database error"
            })))
        }
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
    println!("🔧 Starting default user creation process...");
    
    // Log all relevant environment variables (without exposing the password)
    println!("📋 Environment Variables Check:");
    println!("   DEFAULT_ADMIN_EMAIL: {}", 
        std::env::var("DEFAULT_ADMIN_EMAIL").unwrap_or_else(|_| "NOT SET".to_string()));
    println!("   DEFAULT_ADMIN_PASSWORD: {}", 
        if std::env::var("DEFAULT_ADMIN_PASSWORD").is_ok() { "SET (hidden)" } else { "NOT SET" });
    println!("   DEFAULT_ADMIN_NAME: {}", 
        std::env::var("DEFAULT_ADMIN_NAME").unwrap_or_else(|_| "NOT SET".to_string()));
    
    // First, check if ANY users exist in the database
    println!("🗄️  Checking if any users exist in database...");
    let user_count = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users",
    )
    .fetch_one(db.pool())
    .await?;
    
    println!("👥 Found {} existing users in database", user_count);

    // Only create default user if database is empty
    if user_count == 0 {
        println!("✨ Database is empty, creating default admin user...");
        
        // Use environment variables for default credentials
        let default_email = std::env::var("DEFAULT_ADMIN_EMAIL")
            .unwrap_or_else(|_| {
                println!("⚠️  DEFAULT_ADMIN_EMAIL not set, using fallback");
                "admin@treatments.com".to_string()
            });
        let default_password = std::env::var("DEFAULT_ADMIN_PASSWORD")
            .unwrap_or_else(|_| {
                println!("⚠️  DEFAULT_ADMIN_PASSWORD not set, using fallback");
                "admin123".to_string()
            });
        let default_name = std::env::var("DEFAULT_ADMIN_NAME")
            .unwrap_or_else(|_| {
                println!("⚠️  DEFAULT_ADMIN_NAME not set, using fallback");
                "Treatment Administrator".to_string()
            });

        println!("🔐 Creating user with:");
        println!("   Email: {}", default_email);
        println!("   Name: {}", default_name);
        println!("   Password: {} characters", default_password.len());

        let password_hash = hash(&default_password, DEFAULT_COST).unwrap();
        let user_id = Uuid::new_v4().to_string();  // Convert to string for SQLite
        let now = Utc::now();

        println!("💾 Inserting user into database...");
        sqlx::query(
            "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(&user_id)
        .bind(&default_email)
        .bind(&password_hash)
        .bind(&default_name)
        .bind(now)
        .execute(db.pool())
        .await?;

        println!("✅ Default admin user created successfully!");
        println!("   📧 Email: {}", default_email);
        println!("   👤 Name: {}", default_name);
        println!("   🔑 Password: {} (length: {})", default_password, default_password.len());
        
        // Warn if using default credentials
        if default_email == "admin@treatments.com" && default_password == "admin123" {
            println!("⚠️  WARNING: Using default credentials! Change them immediately in production!");
            println!("   Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD environment variables");
        }
    } else {
        println!("ℹ️  Database already contains {} users, skipping default user creation", user_count);
        
        // Let's also show what users exist (for debugging)
        println!("🔍 Existing users in database:");
        match sqlx::query_as::<_, User>(
            "SELECT id, email, password_hash, name, created_at FROM users LIMIT 5",
        )
        .fetch_all(db.pool())
        .await
        {
            Ok(users) => {
                for user in users.iter().take(3) { // Show only first 3 for security
                    println!("   - {} ({})", user.email, user.name);
                }
                if users.len() > 3 {
                    println!("   ... and {} more", users.len() - 3);
                }
            }
            Err(e) => {
                println!("   ❌ Failed to fetch users: {}", e);
            }
        }
    }

    println!("🏁 Default user creation process completed");
    Ok(())
}

// Debug function to check environment variables (REMOVE IN PRODUCTION!)
pub async fn debug_env_vars() -> Result<HttpResponse> {
    let env_status = serde_json::json!({
        "environment_variables": {
            "DEFAULT_ADMIN_EMAIL": std::env::var("DEFAULT_ADMIN_EMAIL").unwrap_or_else(|_| "NOT_SET".to_string()),
            "DEFAULT_ADMIN_PASSWORD": if std::env::var("DEFAULT_ADMIN_PASSWORD").is_ok() { "SET" } else { "NOT_SET" },
            "DEFAULT_ADMIN_NAME": std::env::var("DEFAULT_ADMIN_NAME").unwrap_or_else(|_| "NOT_SET".to_string()),
            "JWT_SECRET": if std::env::var("JWT_SECRET").is_ok() { "SET" } else { "NOT_SET" },
            "DATABASE_URL": std::env::var("DATABASE_URL").unwrap_or_else(|_| "NOT_SET".to_string()),
            "ENVIRONMENT": std::env::var("ENVIRONMENT").unwrap_or_else(|_| "NOT_SET".to_string()),
            "RUST_LOG": std::env::var("RUST_LOG").unwrap_or_else(|_| "NOT_SET".to_string())
        }
    });
    
    Ok(HttpResponse::Ok().json(env_status))
}

// Force recreate default user (DANGEROUS - REMOVE IN PRODUCTION!)
pub async fn debug_force_create_user(db: web::Data<Database>) -> Result<HttpResponse> {
    println!("🚨 FORCE CREATING DEFAULT USER - THIS SHOULD ONLY BE USED FOR DEBUGGING!");
    
    // Get environment variables
    let default_email = std::env::var("DEFAULT_ADMIN_EMAIL")
        .unwrap_or_else(|_| "admin@treatments.com".to_string());
    let default_password = std::env::var("DEFAULT_ADMIN_PASSWORD")
        .unwrap_or_else(|_| "admin123".to_string());
    let default_name = std::env::var("DEFAULT_ADMIN_NAME")
        .unwrap_or_else(|_| "Treatment Administrator".to_string());

    println!("📧 Using email: {}", default_email);
    println!("👤 Using name: {}", default_name);
    println!("🔑 Password length: {}", default_password.len());
    println!("🔑 Password is ASCII: {}", default_password.is_ascii());
    println!("🔑 Password has whitespace: {}", default_password.chars().any(|c| c.is_whitespace()));
    
    // Log the password characters for debugging (REMOVE THIS AFTER FIXING!)
    println!("🔑 Password first char: '{}'", default_password.chars().next().unwrap_or('?'));
    println!("🔑 Password last char: '{}'", default_password.chars().last().unwrap_or('?'));

    // First, delete any existing user with this email
    match sqlx::query("DELETE FROM users WHERE email = ?")
        .bind(&default_email)
        .execute(db.pool())
        .await
    {
        Ok(result) => println!("🗑️  Deleted {} existing users with email {}", result.rows_affected(), default_email),
        Err(e) => println!("⚠️  Error deleting existing users: {}", e),
    }

    // Create the user
    let password_hash = hash(&default_password, DEFAULT_COST).unwrap();
    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now();

    match sqlx::query(
        "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&user_id)
    .bind(&default_email)
    .bind(&password_hash)
    .bind(&default_name)
    .bind(now)
    .execute(db.pool())
    .await
    {
        Ok(_) => {
            println!("✅ User created successfully!");
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "success": true,
                "message": "Default user force created",
                "email": default_email,
                "name": default_name
            })))
        }
        Err(e) => {
            println!("❌ Failed to create user: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "error": format!("Failed to create user: {}", e)
            })))
        }
    }
}

// Debug function to list all users (remove in production)
pub async fn debug_list_users(db: web::Data<Database>) -> Result<HttpResponse> {
    match sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, name, created_at FROM users",
    )
    .fetch_all(db.pool())
    .await
    {
        Ok(users) => {
            let user_list: Vec<_> = users.iter().map(|u| serde_json::json!({
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "created_at": u.created_at
            })).collect();
            
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "users": user_list,
                "count": users.len()
            })))
        }
        Err(e) => {
            log::error!("Failed to fetch users: {e}");
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch users"
            })))
        }
    }
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
