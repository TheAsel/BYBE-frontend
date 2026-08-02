ARG ALPINE_VERSION=3.24.1
ARG BUN_VERSION=1.3.14
ARG NGINX_VERSION=1.31.2
ARG NGINX_CHECKSUM=af2a957c41da636ddc4f883e4523c6d140b4784dbce42000c364ae5092aa473c

### STAGE 1: Build nginx + brotli ###
FROM alpine:${ALPINE_VERSION} AS brotli-stage
ARG NGINX_VERSION
RUN apk add --no-cache \
    build-base \
    pcre-dev \
    zlib-dev \
    openssl-dev \
    wget \
    git \
    brotli-dev
WORKDIR /app
RUN wget "https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" \
    && echo "${NGINX_CHECKSUM} nginx-${NGINX_VERSION}.tar.gz" | sha256sum -c - \
    && tar -zxf "nginx-${NGINX_VERSION}.tar.gz" \
    && ln -s "nginx-${NGINX_VERSION}" nginx \
    && git clone --recurse-submodules -j8 https://github.com/google/ngx_brotli \
    && cd nginx \
    && ./configure --with-compat --add-dynamic-module=../ngx_brotli \
    && make modules

### STAGE 2: Build frontend ###
FROM oven/bun:${BUN_VERSION}-alpine AS build-stage
WORKDIR /bybe
COPY . .
ARG API_URL
ENV API_URL=$API_URL
RUN bun install --frozen-lockfile --ignore-scripts && bun run build

### STAGE 3: Deploy ###
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine AS deploy-stage

COPY --from=brotli-stage /app/nginx/objs/ngx_http_brotli_static_module.so /etc/nginx/modules/
COPY --from=brotli-stage /app/nginx/objs/ngx_http_brotli_filter_module.so /etc/nginx/modules/

COPY --from=build-stage /bybe/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /bybe/nginx_headers.conf /etc/nginx/nginx_headers.conf
COPY --from=build-stage /bybe/dist/spa /usr/share/nginx/html
EXPOSE 8080
USER nginx
CMD ["nginx", "-g", "daemon off;"]
