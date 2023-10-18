# develop stage
FROM oven/bun:alpine as develop-stage
WORKDIR /bybe
COPY package.json ./
RUN bun add -g @quasar/cli
COPY . .

# build stage
FROM develop-stage as build-stage
RUN bun install
RUN bun run build

# production stage
FROM nginx:1.25.2-alpine as production-stage
COPY --from=build-stage /bybe/dist/spa /usr/share/nginx/html
COPY --from=build-stage /bybe/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]