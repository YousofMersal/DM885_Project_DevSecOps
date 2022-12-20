// use futures_util::future::{Future, Ready};
use actix_utils::future::{ready, Ready};
use awc;
use eyre::bail;
use std::{
    // future::{ready, Ready},
    ops::Deref,
    sync::Arc,
};

use actix_web::{http, web::Data, FromRequest};
use argon2::password_hash::{rand_core::OsRng, SaltString};
use color_eyre::Result;
use sqlx::{self, query_as, PgPool};
use tracing::instrument;
use uuid::Uuid;

use crate::{
    config::secret::SecretService,
    error::AppError,
    models::user::{NewUser, SimpleUser, User},
};

#[derive(Debug)]
pub struct UserRepo {
    pool: Arc<PgPool>,
}

impl UserRepo {
    pub fn new(pool: Arc<PgPool>) -> Self {
        Self { pool }
    }

    pub async fn is_admin(&self, user_id: Uuid) -> Result<bool> {
        let user = self.find_by_id(user_id).await?;
        // Ok(user.map(|user| user.role == "admin").unwrap_or(false))
        Ok(user.map(|user| user.role == "admin").unwrap_or(false))
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

    pub async fn delete_user_by_username(
        &self,
        username: &str,
        id: Uuid,
    ) -> Result<Option<SimpleUser>> {
        //! Delete a user given a username if the id given is an admin
        let is_admin = self.is_admin(id).await?;

        if is_admin {
            let possible_user =
                query_as::<_, User>("DELETE FROM users WHERE username = $1 RETURNING *")
                    .bind(username)
                    .fetch_optional(&*self.pool)
                    .await?;

            // if Some(user) = possible_user {
            //     println!("Deleted user {}", user.id);
            // }

            match possible_user {
                Some(user) => {
                    // let client = awc::Client::default();

                    // let resp = client
                    //     // .post("http://localhost/api/v1/solver/delete")
                    //     .get(format!(
                    //         "http://project.10.108.192.1.sslip.io/api/v1/auth/users"
                    //     ))
                    //     .insert_header(("Authorization", format!("Bearer {}", id)))
                    // .send()
                    // // .send_json(&user.id)
                    // .await;

                    Ok(Some(SimpleUser::from(user)))
                }
                _ => Ok(None),
            }
        } else {
            bail!("User is not an admin")
        }
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<User>> {
        //! Return `Option` of `User` given a Uuid
        let possible_user = query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(&*self.pool)
            .await?;

        Ok(possible_user)
    }

    pub async fn get_all_users(&self, id: Uuid) -> Result<Option<Vec<SimpleUser>>> {
        //! If the id provided is an admin, return all users, otherwise return not authorized error.

        let is_admin = self.is_admin(id).await?;

        if is_admin {
            let users = query_as::<_, SimpleUser>("SELECT id, username, email, role FROM users")
                .fetch_all(&*self.pool)
                .await?;

            Ok(Some(users))
        } else {
            Ok(None)
        }
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
