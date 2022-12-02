pub mod secret;

use std::{sync::Arc, time::Duration};

use color_eyre::Result;
use dotenv::dotenv;
use eyre::Context;
use serde::Deserialize;
use sqlx::{postgres::PgPoolOptions, PgPool};
use tracing::{info, instrument};
use tracing_subscriber::EnvFilter;

use self::secret::SecretService;

#[derive(Debug, Deserialize)]
/// Struct which holds all the server configuration
/// # Panics
/// panics when DATABASE_URL or JWT_SECRET or SECRET_KEY are not set
///
/// # TODO
/// This can be improved immensly,
/// some things there don't need to be env keys however were started that way for ease of development
pub struct Config {
    pub host: String,
    pub port: i32,
    pub database_url: String,
    pub secret_key: String,
    pub jwt_secret: String,
}

impl Config {
    #[instrument]
    pub fn from_env() -> Result<Config> {
        //! Creates config struct from environment variables
        //! it will load a local .env file for easier local development
        //! then just pull in from the local environment
        //! # Panics
        //! Will panic if the neccesary variables are not precent
        dotenv().ok();

        tracing_subscriber::fmt()
            .with_env_filter(EnvFilter::from_default_env())
            .init();

        info!("Loading configuration");

        let conf: Config = config::Config::builder()
            .add_source(config::Environment::default())
            .build()?
            .try_deserialize()?;

        info!("Config serialized");

        Ok(conf)
    }

    pub async fn db_pool(&self) -> Result<PgPool> {
        //! Instantiates the DB_pool pool
        //! Relies on the DATABASE_URL environment variable
        //! # Panics if environment not set up correctly
        info!("Trying to create DB connection pool...");

        PgPoolOptions::new()
            .acquire_timeout(Duration::from_secs(15))
            .max_connections(10)
            .connect(&self.database_url)
            .await
            .context("Database connection creation")
    }

    pub fn secret_service(&self) -> SecretService {
        //! Create a SecretService middleware handler struct
        SecretService {
            salt: Arc::new(self.secret_key.clone()),
            jwt_secret: Arc::new(self.jwt_secret.clone()),
        }
    }
}
