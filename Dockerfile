FROM node:18.18-bookworm-slim

RUN mkdir "bybe"

COPY . bybe/

WORKDIR bybe

RUN npm install -g bun

RUN bun install

RUN bun run build

RUN bun add -g @quasar/cli

EXPOSE 80

CMD ["bun", "run", "start"]