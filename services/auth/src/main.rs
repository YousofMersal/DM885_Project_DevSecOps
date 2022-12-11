mod config;
mod db;
mod error;
mod handlers;
mod models;

use crate::{config::*, handlers::app_config};
use actix_cors::Cors;
use actix_web::{http::header, middleware::Logger, web::Data, App, HttpServer};
use color_eyre::Result;
use colored::Colorize;
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

    info!("DB Pool created");

    let secret_service = config.secret_service();

    println!("Starting auth server at {}:{}", &config.host, &config.port);

    HttpServer::new(move || {
        App::new()
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
            )
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
