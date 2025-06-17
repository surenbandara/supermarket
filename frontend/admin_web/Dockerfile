# Step 1: Build stage
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Step 2: Serve with NGINX
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
