# ----------- Build Stage -----------
FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy necessary files and install only prod dependencies
COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile --prod

# Copy source files and build
COPY . .
RUN pnpm run build

# ----------- Runtime Stage -----------
FROM node:20-slim

WORKDIR /app

# Create a non-root user
RUN useradd -m botuser

# Copy built files and production dependencies only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set permissions
RUN chown -R botuser:botuser /app
USER botuser

# Environment setup
ENV NODE_ENV=production
EXPOSE 3001

# Start the bot
CMD ["node", "dist/app.js"]