# stage 1
FROM rust as chef

RUN rustup toolchain install nightly

USER root
RUN cargo +nightly install -Z sparse-registry --debug cargo-chef
WORKDIR /auth

# stage 2
FROM chef AS planner
COPY . .
RUN cargo +nightly chef prepare --recipe-path recipe.json

# stage 3
FROM chef as builder 
COPY --from=planner /auth/recipe.json recipe.json
RUN cargo +nightly chef cook --release -Z sparse-registry --recipe-path recipe.json
COPY . .
RUN cargo +nightly build --release -Z sparse-registry --bin dm885_auth_service
RUN ls /auth/target/release/dm885_auth_service

# stage 4
FROM debian:buster as runtime 
COPY --from=builder /auth/target/release/dm885_auth_service /usr/bin
RUN apt-get update
RUN apt-get install libssl-dev -y
ENTRYPOINT [ "dm885_auth_service" ]
