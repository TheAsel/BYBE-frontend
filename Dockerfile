### STAGE 1: Build ###
FROM node:20.18-alpine AS build-stage
WORKDIR /bybe
COPY . .
RUN npm install --ignore-scripts && npm run build

### STAGE 2: Deploy ###
FROM nginxinc/nginx-unprivileged:1.27.2-alpine AS deploy-stage
COPY --from=build-stage /bybe/dist/spa /usr/share/nginx/html
COPY --from=build-stage /bybe/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
USER nginx
CMD ["nginx", "-g", "daemon off;"]
