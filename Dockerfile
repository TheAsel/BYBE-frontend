### STAGE 1: Build ###
FROM oven/bun:1.3.14-alpine AS build-stage
WORKDIR /bybe
COPY . .
ARG API_URL
ENV API_URL=$API_URL
RUN bun install --ignore-scripts && bun run build

### STAGE 2: Deploy ###
FROM nginxinc/nginx-unprivileged:1.31.1-alpine AS deploy-stage
COPY --from=build-stage /bybe/dist/spa /usr/share/nginx/html
COPY --from=build-stage /bybe/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
USER nginx
CMD ["nginx", "-g", "daemon off;"]
