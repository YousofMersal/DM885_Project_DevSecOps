pub mod secret;

use std::{sync::Arc, time::Duration};

use color_eyre::Result;
use dotenv::dotenv;
use eyre::Context;
use serde::Deserialize;
use sqlx::{migrate::Migrator, postgres::PgPoolOptions, PgPool};
use tracing::{info, instrument};
use tracing_subscriber::EnvFilter;

use self::secret::SecretService;

pub static MIGRATOR: Migrator = sqlx::migrate!();

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

        let vars = vec!["PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD", "PGPORT"];

        // check that all vars are set and panic if not then create database uri from them
        let database_url_vals = vars
            .iter()
            .map(|var| {
                std::env::var(var)
                    .with_context(|| format!("{} is not set", var))
                    .unwrap()
            })
            .collect::<Vec<String>>();

        let database_url = format!(
            "postgres://{}:{}@{}:{}/{}",
            database_url_vals[2],
            database_url_vals[3],
            database_url_vals[0],
            database_url_vals[4],
            database_url_vals[1]
        );

        let conf: Config = Config {
            host: std::env::var("HOST").context("HOST is not set")?,
            port: std::env::var("PORT").context("PORT is not set")?.parse()?,
            database_url,
            secret_key: std::env::var("SECRET_KEY").context("SECRET_KEY is not set")?,
            jwt_secret: std::env::var("JWT_SECRET").context("JWT_SECRET is not set")?,
        };

        info!("Config serialized");

        Ok(conf)
    }

    pub async fn db_pool(&self) -> Result<PgPool> {
        //! Instantiates the DB_pool pool
        //! Relies on the DATABASE_URL environment variable
        //! # Panics if environment not set up correctly
        info!("Trying to create DB connection pool...");

        let pool = PgPoolOptions::new()
            .acquire_timeout(Duration::from_secs(20))
            .max_connections(10)
            .connect(&self.database_url)
            .await
            .context("Database connection creation")?;

        self.migrate_db(&pool).await?;

        Ok(pool)
    }

    pub async fn migrate_db(&self, pool: &PgPool) -> Result<()> {
        //! Migrates the database to the latest version
        MIGRATOR.run(pool).await?;
        Ok(())
    }

    pub fn secret_service(&self) -> SecretService {
        //! Create a SecretService middleware handler struct
        SecretService {
            salt: Arc::new(self.secret_key.clone()),
            jwt_secret: Arc::new(self.jwt_secret.clone()),
        }
    }
}
