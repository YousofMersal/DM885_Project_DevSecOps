FROM node

WORKDIR /app

COPY ./package*.json .
RUN npm install

COPY ./src ./src

ENTRYPOINT [ "npm", "start" ]
