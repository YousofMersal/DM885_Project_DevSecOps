use std::fmt::Display;

use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use color_eyre::Report;
use serde::Serialize;
use tracing::error;

#[derive(Debug, Serialize)]
pub struct AppError {
    message: String,
    code: ErrorCode,
}

#[derive(Debug, PartialEq, Eq)]
pub struct ErrorCode(i32);

impl Serialize for ErrorCode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_i32(self.0)
    }
}

impl ErrorCode {
    pub fn message(self, message: String) -> AppError {
        AppError {
            message,
            code: self,
        }
    }

    pub fn default(self) -> AppError {
        let message = match self {
            AppError::INVALID_INPUT => "Invalid input.",
            AppError::INVALID_CREDENTIALS => "Invalid username or password.",
            AppError::NOT_AUTHORIZED => "Not authorized.",
            AppError::NOT_FOUND => "Item not found.",
            _ => "Unexpected error",
        }
        .to_string();

        AppError {
            message,
            code: self,
        }
    }
}

impl From<ErrorCode> for AppError {
    fn from(err: ErrorCode) -> Self {
        err.default()
    }
}

impl From<Report> for AppError {
    fn from(err: Report) -> Self {
        error!("{:?}", err);
        Self::INTERNAL_ERROR.message("Unexpected error ocurred".to_string())
    }
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self.code {
            Self::INVALID_INPUT => StatusCode::BAD_REQUEST,
            Self::NOT_FOUND => StatusCode::NOT_FOUND,
            Self::NOT_AUTHORIZED => StatusCode::UNAUTHORIZED,
            Self::INVALID_CREDENTIALS => StatusCode::UNAUTHORIZED,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
        HttpResponse::build(self.status_code()).json(self)
    }
}

impl Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl AppError {
    pub const INTERNAL_ERROR: ErrorCode = ErrorCode(101);
    pub const INVALID_INPUT: ErrorCode = ErrorCode(201);
    pub const INVALID_CREDENTIALS: ErrorCode = ErrorCode(301);
    pub const NOT_AUTHORIZED: ErrorCode = ErrorCode(302);
    pub const NOT_FOUND: ErrorCode = ErrorCode(401);
}
