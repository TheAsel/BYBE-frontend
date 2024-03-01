# develop stage
FROM node:20.11.1-alpine AS develop-stage
WORKDIR /bybe
COPY package.json ./
RUN npm install -g @quasar/cli --ignore-scripts
COPY . .

# build stage
FROM develop-stage AS build-stage
RUN npm install --ignore-scripts
RUN npm run build

# production stage
FROM nginx:1.25.4-alpine AS production-stage
COPY --from=build-stage /bybe/dist/spa /usr/share/nginx/html
COPY --from=build-stage /bybe/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]