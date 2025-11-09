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
RUN rm -rf node_modules/.prisma && npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies AND prisma CLI (needed for migrations)
# We need prisma CLI for release_command (migrations)
RUN npm ci --only=production && \
    npm install prisma@^6.13.0 --save-dev --no-save

# Copy the generated Prisma Client from builder stage
# This includes the binary and generated code
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port (Fly.io uses PORT env var, but 8080 is the default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/', (r) => {process.exit(r.statusCode === 401 ? 0 : 1)})"

# Start server
CMD ["node", "dist/src/index.js"]