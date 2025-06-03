# Multi-stage build for Smart Timetable & Substitution Manager

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ ./

# Stage 3: Final Image
FROM node:18-alpine
WORKDIR /app

# Install required tools
RUN apk add --no-cache mongodb-tools curl

# Create app structure
COPY --from=backend-build /app/backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create a .env file with defaults (will be overridden by environment variables)
RUN echo "NODE_ENV=production" > ./backend/.env \
    && echo "PORT=5001" >> ./backend/.env \
    && echo "MONGO_URI=mongodb://localhost:27017/timetable_db" >> ./backend/.env \
    && echo "JWT_SECRET=default_jwt_secret_replace_in_production" >> ./backend/.env \
    && echo "JWT_EXPIRE=30d" >> ./backend/.env

# Install serve to serve the frontend
RUN npm install -g serve

# Copy startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose ports
EXPOSE 5001 3000

# Set environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=5001
ENV FRONTEND_PORT=3000

# Set working directory to backend
WORKDIR /app/backend

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:5001/api/health || exit 1

# Start the application
ENTRYPOINT ["docker-entrypoint.sh"] 