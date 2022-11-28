use std::sync::Arc;

use actix_web::web::block;
use argon2::{password_hash::SaltString, Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use chrono::Utc;
use color_eyre::Result;
use eyre::{eyre, Context};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone)]
/// SecretService which holds the salt and jwt_secret for the specific user
/// This is very much not best practice in security however options were left open
/// with different implementations for the group to decide
pub struct SecretService {
    pub salt: Arc<String>,
    pub jwt_secret: Arc<String>,
}

#[derive(Serialize, Deserialize)]
/// JWT claims for a token
pub struct Claims {
    pub sub: Uuid,
    pub exp: i64,
}

#[derive(Debug, Serialize)]
/// Represents an authentication token as a string
pub struct Auth {
    pub token: String,
}

impl SecretService {
    pub async fn hash_password(&self, password: String, salt_str: &str) -> Result<String> {
        //! Given a password and a salt uses argon2 to hash a password
        let salt = SaltString::new(salt_str)?;

        let argon = Argon2::default(); // dafault params can be changed at will
                                       // see https://docs.rs/argon2/latest/argon2/

        Ok(argon
            .hash_password(password.as_bytes(), &salt)
            .context("Creating hash")?
            .to_string())
    }

    pub async fn verify_password(&self, password: &str, hash: &str) -> Result<bool> {
        //! Given a password and the hash of a password check wheather the provided password hashes into the same hash.
        //! If this is the case the password is correct and a truty value is returned.
        let argon = Argon2::default(); // dafault params can be changed at will
                                       // see https://docs.rs/argon2/latest/argon2/

        let pass_hash = PasswordHash::new(hash)?;

        Ok(argon
            .verify_password(password.as_bytes(), &pass_hash)
            .is_ok())
    }

    pub async fn generate_jwt(&self, user_id: Uuid) -> Result<String> {
        //! Generate a JWT given the Uuid of the user
        let jwt_key = self.jwt_secret.clone();
        block(move || {
            let hdrs = Header::default();
            let encoding_key = EncodingKey::from_secret(jwt_key.as_bytes());
            let now = Utc::now() + chrono::Duration::days(1); // expiration time is 1 day
            let claims = Claims {
                sub: user_id,
                exp: now.timestamp(),
            };
            encode(&hdrs, &claims, &encoding_key)
        })
        .await?
        .map_err(|e| eyre!("Creating JWT: {}", e))
    }

    pub async fn verify_jwt(&self, token: String) -> Result<TokenData<Claims>> {
        //! Verify that the JWT is valid
        let jwt_key = self.jwt_secret.clone();

        block(move || {
            let decoding_key = DecodingKey::from_secret(jwt_key.as_bytes());
            let validator = Validation::default();
            decode::<Claims>(&token, &decoding_key, &validator)
        })
        .await?
        .map_err(|e| eyre!("Verifying JWT: {}", e))
    }
}
