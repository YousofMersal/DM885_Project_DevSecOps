#stage 1
FROM clux/muslrust:stable as chef
USER root
RUN cargo install cargo-chef
WORKDIR /auth

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# state 2
FROM chef as builder 
COPY --from=planner /auth/recipe.json recipe.json
RUN cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl --bin dm885_auth_service


FROM alpine as runtime 
RUN addgroup -S auth && adduser -S auth -G auth
COPY --from=builder /auth/target/x86_64-unknown-linux-musl/release/dm885_auth_service /usr/local/bin
USER auth
ENTRYPOINT [ "/usr/local/bin/dm885_auth_service" ]
