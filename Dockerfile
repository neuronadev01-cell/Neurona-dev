# Multi-stage build for Neurona Mental Health Platform

# Build stage
FROM node:18-alpine AS builder

# Install system dependencies
RUN apk add --no-cache libc6-compat python3 make g++ curl

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci
RUN cd frontend && npm ci
RUN cd backend && npm ci

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build frontend
RUN cd frontend && npm run build

# Build backend (if TypeScript)
RUN cd backend && npm run build 2>/dev/null || echo "Backend build not available, using source files"

# Production stage
FROM node:18-alpine AS production

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S neurona -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=neurona:nodejs package*.json ./
COPY --chown=neurona:nodejs backend/package*.json ./backend/

# Install only production dependencies for backend
RUN cd backend && npm ci --only=production && npm cache clean --force

# Copy built frontend
COPY --from=builder --chown=neurona:nodejs /app/frontend/build ./frontend/build
COPY --from=builder --chown=neurona:nodejs /app/frontend/.next ./frontend/.next
COPY --from=builder --chown=neurona:nodejs /app/frontend/public ./frontend/public

# Copy backend files
COPY --from=builder --chown=neurona:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=neurona:nodejs /app/backend/src ./backend/src
COPY --from=builder --chown=neurona:nodejs /app/backend/node_modules ./backend/node_modules

# Copy additional backend files
COPY --chown=neurona:nodejs backend/migrations ./backend/migrations
COPY --chown=neurona:nodejs backend/seeds ./backend/seeds

# Set permissions
RUN chown -R neurona:nodejs /app
USER neurona

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application with backend server
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/dist/index.js"]
