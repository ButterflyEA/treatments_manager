use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,  // Store UUID as string for SQLite
    pub email: String,
    pub password_hash: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: String,  // Store UUID as string
    pub email: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user id
    pub email: String,
    pub exp: usize,
    pub iat: usize,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub email: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

impl From<User> for UserInfo {
    fn from(user: User) -> Self {
        UserInfo {
            id: user.id,
            email: user.email,
            name: user.name,
        }
    }
}
