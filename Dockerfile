# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build

# Stage 2: Run
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

COPY --from=build /usr/src/app/dist ./dist
COPY .env.prod .env

CMD ["node", "dist/app.js"]
