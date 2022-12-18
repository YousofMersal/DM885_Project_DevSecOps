use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, sqlx::FromRow, Debug)]
/// User struct which holds all information relevant for this service about any specific user
/// Can be directly Deserialized from a sqlx row, and serialized into that is needed down the line.
pub struct User {
    pub id: Uuid,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role: String,
    pub salt: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
/// Struct which represents information needed to create a new user.
/// Every user defaults to an "user" and not an "admin" as it is TBD how this is handled with the group
pub struct NewUser {
    pub username: String,
    pub password: String,
    pub email: String,
}

#[derive(Serialize, sqlx::FromRow, Debug, Deserialize)]
/// Struct which represents information about a user that is safe to send to the client
pub struct SimpleUser {
    pub username: String,
    pub role: String,
    pub email: String,
}
