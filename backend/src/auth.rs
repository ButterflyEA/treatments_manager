use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use std::env;
use chrono::{Duration, Utc};
use crate::models::Claims;
use anyhow::Result;

pub struct JwtUtils;

impl JwtUtils {
    pub fn get_secret() -> String {
        env::var("JWT_SECRET").unwrap_or_else(|_| "your-secret-key".to_string())
    }

    pub fn create_token(user_id: &str, email: &str) -> Result<String> {
        let now = Utc::now();
        let exp = (now + Duration::hours(24)).timestamp() as usize;
        let iat = now.timestamp() as usize;

        let claims = Claims {
            sub: user_id.to_string(),
            email: email.to_string(),
            exp,
            iat,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(Self::get_secret().as_ref()),
        )?;

        Ok(token)
    }

    pub fn verify_token(token: &str) -> Result<Claims> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(Self::get_secret().as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }
}
