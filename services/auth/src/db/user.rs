// use futures_util::future::{Future, Ready};
use actix_utils::future::{ready, Ready};
use std::{
    // future::{ready, Ready},
    ops::Deref,
    sync::Arc,
};

use actix_web::{web::Data, FromRequest};
use argon2::password_hash::{rand_core::OsRng, SaltString};
use color_eyre::Result;
use sqlx::{self, query_as, PgPool};
use tracing::instrument;
use uuid::Uuid;

use crate::{
    config::secret::SecretService,
    error::AppError,
    models::user::{NewUser, User},
};

pub struct UserRepo {
    pool: Arc<PgPool>,
}

impl UserRepo {
    pub fn new(pool: Arc<PgPool>) -> Self {
        Self { pool }
    }

    #[instrument(skip(self, new_user, secret_service))] // only instrument what is actually going on inside the function
    pub async fn create(&self, new_user: NewUser, secret_service: &SecretService) -> Result<User> {
        //! Create a new user given a NewUser struct and and secret service
        let salt = SaltString::generate(&mut OsRng);

        let pass_hash = secret_service
            .hash_password(new_user.password, salt.as_str())
            .await?;

        let user = query_as::<_, User>(
            "insert into users (username, email, password_hash, role, salt) values ($1, $2, $3, $4, $5) returning *",
        )
        .bind(new_user.username)
        .bind(new_user.email)
        .bind(pass_hash)
        .bind("user")
        .bind(salt.to_string())
        .fetch_one(&*self.pool)
        .await?;

        Ok(user)
    }

    #[instrument(skip(self, user_id, user, secret_service))] // only instrument what is actually going on inside the function
    pub async fn update_user(
        &self,
        user_id: Uuid,
        user: NewUser,
        secret_service: &SecretService,
    ) -> Result<User> {
        //! Will update the user with the information given.
        //! Right now every option must be changed, however the SQL query is made so that if an option is not provided nothing in that column will change.
        //! This is so that a more specific API can be decided later if neccesary.
        let salt = SaltString::generate(&mut OsRng);

        let pass_hash = secret_service
            .hash_password(user.password, salt.as_str())
            .await?;

        let user = query_as::<_, User>(
            r#"UPDATE users SET 
            username = case when $1 is null then username else $1 end,
            email = case when $2 is null then email else $2 end,
            password = case when $3 is null then email else $3 end,
            WHERE id = $4
            returning *"#,
        )
        .bind(user.username)
        .bind(user.email)
        .bind(pass_hash)
        .bind(user_id)
        .fetch_one(&*self.pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_username(&self, username: &str) -> Result<Option<User>> {
        //! Return `Option` of `User` given a username
        let possible_user = query_as::<_, User>("SELECT * FROM users WHERE username = $1")
            .bind(username)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(possible_user)
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<User>> {
        //! Return `Option` of `User` given a Uuid
        let possible_user = query_as::<_, User>("select * from users where id = $1")
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(possible_user)
    }
}

impl FromRequest for UserRepo {
    type Error = AppError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let pool_res = Data::<PgPool>::from_request(req, payload).into_inner();

        match pool_res {
            Ok(pool) => ready(Ok(UserRepo::new(pool.deref().clone()))),
            _ => ready(Err(AppError::NOT_AUTHORIZED.default())),
        }
    }
}
