### STAGE 1: Build ###
FROM node:20.17-alpine AS build-stage
WORKDIR /bybe
COPY . .
RUN npm install --ignore-scripts && npm run build

### STAGE 2: Deploy ###
FROM nginx:1.27.1-alpine AS deploy-stage
COPY --from=build-stage /bybe/dist/spa /usr/share/nginx/html
COPY --from=build-stage /bybe/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
