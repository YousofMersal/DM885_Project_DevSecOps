use actix_web::{
    web::{Data, Json, Path},
    HttpResponse,
};

use regex::Regex;

use tracing::{debug, instrument};

use crate::{
    config::secret::SecretService, db::user::UserRepo, error::AppError, models::user::NewUser,
};

use super::{auth::AuthenticatedUser, AppResponse};

pub async fn create_user(
    user: Json<NewUser>,
    repo: UserRepo,
    secret_service: Data<SecretService>,
) -> AppResponse {
    //! Will be called when a new user is created.
    //! This takes advantage of (de)serialization to get Json into a NewUser rust struct which is then processed into a User struct,
    //! and addeed to database with relevant error messaging
    let email_regex = Regex::new(
        r"^([a-z0-9_+]([a-z0-9_+.]*[a-z0-9_+])?)@([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6})",
    )
    .unwrap();

    if user.username.len() < 1 {
        return Err(AppError::INVALID_INPUT.message("Username too short!".to_string()));
    } else if !email_regex.is_match(&user.email) {
        return Err(AppError::INVALID_INPUT.message(format!("malformed email {}", user.email)));
    };

    let res = repo.create(user.0, secret_service.as_ref()).await;

    match res {
        Ok(user) => Ok(HttpResponse::Ok().json(user)),
        Err(e) => {
            let Some(d) = e.downcast_ref::<sqlx::error::Error>() else {
                    debug!("Error creating user {:?}", e);
                    return Err(AppError::INTERNAL_ERROR.into())
        };
            let Some(pg_error) = d.as_database_error() else {
                    debug!("Error creating user {:?}", e);
                    return Err(AppError::INTERNAL_ERROR.into())};

            match pg_error.constraint() {
                Some("users_email_key") => {
                    Err(AppError::INVALID_INPUT.message("Email already exists".to_string()))
                }
                Some("users_username_key") => {
                    Err(AppError::INVALID_INPUT.message("username already exists".to_string()))
                }
                Some("None") => {
                    Err(AppError::INVALID_INPUT
                        .message("username or email already exists".to_string()))
                }
                _ => Err(AppError::INTERNAL_ERROR.into()),
            }
        }
    }
}

#[instrument[skip(user_repo)]]
pub async fn list_self(user: AuthenticatedUser, user_repo: UserRepo) -> AppResponse {
    let user = user_repo
        .find_by_id(user.0)
        .await?
        .ok_or(AppError::INTERNAL_ERROR)?;

    Ok(HttpResponse::Ok().json(user))
}

#[instrument[skip(user_repo)]]
pub async fn list_users(user_repo: UserRepo, user: AuthenticatedUser) -> AppResponse {
    let user = user_repo
        .get_all_users(user.0)
        .await?
        .ok_or(AppError::NOT_AUTHORIZED)?;

    Ok(HttpResponse::Ok().json(user))
}

pub async fn delete_user(
    destroy_user: Path<String>,
    user_repo: UserRepo,
    user: AuthenticatedUser,
) -> AppResponse {
    let destroy_user = destroy_user.into_inner();

    let db_res = user_repo
        .delete_user_by_username(&destroy_user, user.0)
        .await;

    match db_res {
        Ok(res) => match res {
            Some(user) => Ok(HttpResponse::Ok().json(user)),
            None => Err(AppError::NOT_FOUND.into()),
        },
        Err(_) => Err(AppError::NOT_AUTHORIZED.into()),
    }
}
