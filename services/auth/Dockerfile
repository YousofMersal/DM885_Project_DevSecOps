FROM lukemathwalker/cargo-chef:latest-rust-1.65.0 AS chef
WORKDIR dm885_auth_service

FROM chef AS planner
COPY . .
RUN rustup install nightly-2022-11-27
RUN rustup default nightly-2022-11-27
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /dm885_auth_service/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
# Build application
COPY . .
RUN cargo build --release --bin dm885_auth_service

FROM debian:bullseye-slim AS runtime
WORKDIR dm885_auth_service
COPY --from=builder /dm885_auth_service/target/release/dm885_auth_service /usr/local/bin
ENTRYPOINT ["/usr/local/bin/dm885_auth_service"]
