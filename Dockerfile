### STAGE 1: Build ###
FROM oven/bun:1.1.42-alpine AS build-stage
WORKDIR /bybe
COPY . .
RUN bun install --production && bun run build

### STAGE 2: Deploy ###
FROM nginxinc/nginx-unprivileged:1.27.3-alpine AS deploy-stage
COPY --from=build-stage /bybe/dist/spa /usr/share/nginx/html
COPY --from=build-stage /bybe/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
USER nginx
CMD ["nginx", "-g", "daemon off;"]
