# Base image
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install build essentials for argon2
RUN apk add --no-cache make gcc g++ python3

# Install dependencies and rebuild argon2 from source
RUN npm ci --build-from-source

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

# Install runtime dependencies for argon2
RUN apk add --no-cache libstdc++

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main"]