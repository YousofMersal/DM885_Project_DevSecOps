# Authentication Microservice

For local development without docker a  rust (1.65 is guaranteed to work) compiler is required,.
However a docker image is provided wich makes this uneccesary, where everything can be built inside the container, and multistage build is used to drastically reduce compile times/binary size.

To get the service to run a PostgresSQL database is required, and the folowing environmental variables set for either the shell or the docker container
 - HOST: Which is the host the server is to be run on
 - PORT: The port the server is listening on
 - DB_URL: The url of the database example postgres://auth:auth@localhost:5432/auth
 - SECRET_KEY: Which is the secretkey that the server uses and can be any string
 - RUST_LOG: Optional but recommended to set this to "debug,actix_web=debug,sqlx=info" for maximal logging
 - JWT_SECRET Which is the secet key used to encrypting the JWT which can be anything 

If a rust compiler is installed then just run `cargo run` in the folder to build and run the server.
Otherwise the docker image can be used by running `docker build -t auth .` and then run `docker run auth` to run the service.
to provide environmental variables to docker either the use of an .env file can be used like so `docker run --env-file ./.env auth`
or through feeding each variable to docker with `--env VAR=VAL`

