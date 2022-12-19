pub mod auth;
pub mod user;

use actix_web::{
    web::{self, ServiceConfig},
    HttpResponse,
};

use crate::error::AppError;

use self::{
    auth::auth,
    user::{create_user, delete_user, list_users},
};

// QOL shorthands
type AppResult<T> = Result<T, AppError>;
type AppResponse = AppResult<HttpResponse>;

pub fn app_config(config: &mut ServiceConfig) {
    //! This function is where all the middleware and the routes are registered.
    //! as of right now this is rather bare as this the API, we didn't really specify what this service is responsible for.

    let users = web::resource("/users")
        .route(web::post().to(create_user))
        .route(web::get().to(list_users));

    let delete_user = web::resource("/users/{id}").route(web::delete().to(delete_user));

    let auth = web::resource("/users/login").route(web::post().to(auth));

    config.service(users).service(auth).service(delete_user);
}
