mod config;
mod db;
mod error;
mod handlers;
mod models;

use crate::{config::*, handlers::app_config};
use actix_cors::Cors;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use argon2::password_hash::{rand_core::OsRng, SaltString};
use color_eyre::Result;
use colored::Colorize;
use config::secret::SecretService;
use eyre::bail;
use models::user::User;
use sqlx::{query_as, PgPool};
use tracing::info;

#[actix_rt::main]
async fn main() -> Result<()> {
    let config = Config::from_env().expect("Server configuration failed");

    info!(
        "Starting server at {}",
        format!("http://{}:{}", config.host, config.port)
            .bold()
            .underline()
            .green(),
    );

    let db_pool = config
        .db_pool()
        .await
        .expect("Could not create db connection");

    let db_pool_cl = db_pool.clone();

    info!("DB Pool created");

    let secret_service = config.secret_service();

    let secret_service_cl = secret_service.clone();

    match set_admin_if_not_exists(secret_service_cl, db_pool_cl) {
        Ok(_) => info!("Admin user created"),
        Err(e) => bail!("Admin user already exists: {}", e),
    };

    println!("Starting auth server at {}:{}", &config.host, &config.port);

    HttpServer::new(move || {
        let app = App::new()
            .wrap(
                Cors::permissive(), // Cors::default()
                                    //     .allowed_origin(format!("http://127.0.0.1:{}", &config.port).as_str())
                                    //     .allowed_origin_fn(|origin, _req_head| {
                                    //         origin
                                    //             .as_bytes()
                                    //             .starts_with(format!("http://{}", &config.port.clone).as_bytes())
                                    //     })
                                    //     .allowed_methods(vec!["GET", "POST", "PUT"])
                                    //     .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
                                    //     .allowed_header(header::CONTENT_TYPE)
                                    //     .supports_credentials()
                                    //     .max_age(3600),
            )
            .service(
                actix_web::web::scope("/api/v1/auth")
                    .wrap(Logger::default()) // add loging to web framework
                    // add middleware
                    .app_data(Data::new(db_pool.clone())) // clone is cheap as its an RC under the hood
                    .app_data(Data::new(secret_service.clone())) // add second middleware
                    .configure(app_config),
            );

        app
    })
    .workers(
        std::env::var("ACTIX_WORKERS")
            .unwrap_or(String::from("1"))
            .parse::<usize>()?,
    )
    .bind(format!("{}:{}", &config.host, &config.port))? // bind ports gotten from ENV
    .run()
    .await?;

    Ok(())
}

fn set_admin_if_not_exists(secret_service: SecretService, db_pool: PgPool) -> Result<()> {
    actix_web::rt::spawn(async move {
        let admin = query_as::<_, User>("SELECT * FROM users WHERE username = 'admin@admin.com'")
            .fetch_one(&db_pool)
            .await;

        if let Err(_) = admin {
            let default_admin = create_admin(secret_service, db_pool).await;
            match default_admin {
                Ok(_) => info!("Admin user created"),
                Err(e) => panic!("Could not create admin user: {}", e),
            }
        };
    });
    Ok(())
}

pub async fn create_admin(secret_service: SecretService, pool: PgPool) -> Result<User> {
    //! create admin user if not exists
    //! *IMPORTANT*: This function should be called only once
    //! and the admin user should change their password after the first login
    //! it is the users responsibility to change their password

    let salt = SaltString::generate(&mut OsRng);

    let pass_hash = secret_service
        .hash_password("admin".to_string(), salt.as_str())
        .await?;

    let user = query_as::<_, User>(
        "insert into users (username, email, password_hash, role, salt) values ($1, $2, $3, $4, $5) returning *",
    )
    .bind("admin@admin.com")
    .bind("admin@admin.com")
    .bind(pass_hash)
    .bind("user")
    .bind(salt.to_string())
    .fetch_one(&pool)
    .await?;

    Ok(user)
}

#[cfg(test)]
mod tests {
    #![allow(unused_imports)]
    use crate::{config::Config, handlers::user::create_user};

    use super::*;

    use actix_web::{
        dev::Service,
        http::{self, header::ContentType},
        test, web,
    };
    use serde::Serialize;
    use sqlx::PgPool;
    use sqlx::Row;
    use std::env;

    #[derive(Serialize)]
    struct FrontendUser {
        username: String,
        password: String,
        email: String,
    }

    // #[actix_web::test]
    // async fn test_index_ok() {
    //     env::set_var(
    //         "PGDATABASE",
    //         "postgres://postgres:postgres@localhost:5432/postgres",
    //     );

    //     let mut config = Config::from_env().expect("Server configuration failed");
    //     config.set_uri("postgresql://postgres:postgres@localhost:5432/auth_test".to_string());
    //     let db_pool = config
    //         .db_pool()
    //         .await
    //         .expect("Could not create db connection");
    //     let secret_service = config.secret_service();

    //     let app = test::init_service(
    //         App::new()
    //             .app_data(Data::new(db_pool))
    //             .app_data(Data::new(secret_service))
    //             .configure(|cfg| {
    //                 cfg.service(web::resource("/users").route(web::post().to(create_user)));
    //             }),
    //     )
    //     .await;

    //     let req = test::TestRequest::default()
    //         .insert_header(ContentType::json())
    //         .set_json(FrontendUser {
    //             username: "user1".to_string(),
    //             password: "user1".to_string(),
    //             email: "user1@user.com".to_string(),
    //         })
    //         .to_request();

    //     let res = app.call(req).await.unwrap();

    //     assert_eq!(res.status(), http::StatusCode::OK);
    // }

    // #[sqlx::test(migrator = "config::MIGRATOR")]
    // async fn basic_db_test(pool: PgPool) -> sqlx::Result<()> {
    //     let mut conn = pool.acquire().await?;

    //     let db_res = sqlx::query("SELECT username FROM users where email = 'admin@admin.com'")
    //         .fetch_one(&mut conn)
    //         .await?;

    //     assert_eq!(db_res.get::<String, _>("username"), "admin@admin.com");

    //     Ok(())
    // }

    #[test]
    async fn basic_test() {
        assert_eq!(2 + 2, 4);
    }
}
