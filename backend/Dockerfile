# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client (clean any existing generation first)
RUN rm -rf src/generated && npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies first
RUN npm ci --only=production

# Copy Prisma CLI from builder stage
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma binary
RUN mkdir -p ./node_modules/.bin
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Install Prisma CLI dependencies that are needed for migrations
# These are required by @prisma/config which is used by prisma CLI
# We install them explicitly to ensure they're available in production
RUN npm install --no-save --production=false \
    read-package-up@^11.0.0 \
    read-pkg@^9.0.0 \
    find-up-simple@^1.0.1 \
    c12@^3.1.0 \
    @prisma/config@^6.13.0

# Copy the generated Prisma Client from builder stage
COPY --from=builder /app/src/generated ./src/generated

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port (Fly.io uses PORT env var, but 8080 is the default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/', (r) => {process.exit(r.statusCode === 401 ? 0 : 1)})"

# Start server
CMD ["node", "dist/src/index.js"]