FROM node:19 AS builder

WORKDIR /app

COPY ./package*.json ./
RUN npm install

COPY . ./
RUN npm run build

# Serve static files from small container
FROM nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist ./

