use actix_utils::future::ready;
use actix_web::{
    web::{Data, Json},
    FromRequest, HttpResponse,
};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use serde::Deserialize;
use tracing::{debug, instrument};
use uuid::Uuid;

use crate::{
    config::secret::{Auth, SecretService},
    db::user::UserRepo,
    error::AppError,
};

use super::AppResponse;

#[derive(Debug, Deserialize)]
pub struct Loginfo {
    pub username: String,
    pub password: String,
}

#[derive(Debug)]
pub struct AuthenticatedUser(pub Uuid, pub String);
impl FromRequest for AuthenticatedUser {
    type Error = AppError;

    type Future = std::pin::Pin<Box<dyn std::future::Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let bearer_result = BearerAuth::from_request(req, payload).into_inner();
        let repo_results = UserRepo::from_request(req, payload).into_inner();
        let secret_service_result = Data::<SecretService>::from_request(req, payload).into_inner();

        if let (Ok(bearer), Ok(repo), Ok(secret_service)) =
            (bearer_result, repo_results, secret_service_result)
        {
            let future = async move {
                let user_id = secret_service
                    .verify_jwt(bearer.token().to_string())
                    .await
                    .map(|data| data.claims.sub)
                    .map_err(|err| {
                        debug!("JWT verification failed: {:?}", err);
                        AppError::NOT_AUTHORIZED
                    })?;

                repo.find_by_id(user_id).await?.ok_or_else(|| {
                    debug!("User {} could not be found", user_id);
                    AppError::NOT_AUTHORIZED
                })?;

                Ok(AuthenticatedUser(user_id, bearer.token().to_string()))
            };
            Box::pin(future)
        } else {
            let error = Err(AppError::NOT_AUTHORIZED.into());
            Box::pin(ready(error))
        }
    }
}

#[instrument(skip(loginfo, repo, secret_service))]
pub async fn auth(
    loginfo: Json<Loginfo>,
    repo: UserRepo,
    secret_service: Data<SecretService>,
) -> AppResponse {
    //! ## Authentication endpoint.
    //! This is the endpoint which takes a Json object with Loginfo which is just the username and password.
    //! to check wheather a valid user with the given password exists.
    let user = repo
        .find_by_username(&loginfo.username)
        .await?
        .ok_or_else(|| {
            debug!("User dosn't exist.");
            AppError::INVALID_CREDENTIALS
        })?;

    let is_valid = secret_service
        .verify_password(&loginfo.password, &user.password_hash)
        .await?;

    if is_valid {
        let token = secret_service.generate_jwt(user.id, user.role).await?;
        Ok(HttpResponse::Ok().json(Auth { token }))
    } else {
        debug!("Invalid password.");
        Err(AppError::INVALID_CREDENTIALS.into())
    }
}
