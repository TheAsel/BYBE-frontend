# develop stage
FROM node:20.11.1-alpine AS develop-stage
WORKDIR /bybe
COPY package.json ./
RUN npm install --ignore-scripts -g @quasar/cli
COPY . .

# build stage
FROM develop-stage AS build-stage
RUN npm install --ignore-scripts
# Temporary vue3-tour fix until https://github.com/alexandreDavid/vue3-tour/pull/27 is merged
RUN sed -i 's/"module": "dist\/vue3-tour\.es\.js",/"module": "dist\/vue3-tour\.js",/' ./node_modules/vue3-tour/package.json
RUN npm run build

# production stage
FROM nginx:1.25.4-alpine AS production-stage
COPY --from=build-stage /bybe/dist/spa /usr/share/nginx/html
COPY --from=build-stage /bybe/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
