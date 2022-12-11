#stage 1
FROM rust as chef

# Install Rust
#RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain 1.61.0 -y
#ENV PATH=/root/.cargo/bin:$PATH

# Switch Rust to the nightly bui
RUN rustup toolchain install nightly

# Install the cargo-ament-build plugin
# RUN cargo +nightly install -Z sparse-registry --debug cargo-ament-build 

USER root
RUN cargo +nightly install -Z sparse-registry --debug cargo-chef
WORKDIR /auth

FROM chef AS planner
COPY . .
RUN cargo +nightly chef prepare --recipe-path recipe.json

# state 2
FROM chef as builder 
COPY --from=planner /auth/recipe.json recipe.json
RUN cargo +nightly chef cook --release -Z sparse-registry --recipe-path recipe.json
COPY . .
RUN cargo +nightly build --release -Z sparse-registry --bin dm885_auth_service
RUN ls /auth/target/release/dm885_auth_service

FROM debian:buster as runtime 
COPY --from=builder /auth/target/release/dm885_auth_service /usr/bin
RUN apt-get update
RUN apt-get install libssl-dev -y
ENTRYPOINT [ "dm885_auth_service" ]
