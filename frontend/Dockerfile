FROM node:20 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Install Vite globally (optional, useful for docker CMD)
RUN npm install -g vite

COPY . .

# Build the app for production
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install serve to serve the static files
RUN npm install -g serve

# Copy build files from the build stage
COPY --from=build /app/dist /app/dist

# Use port 3000 for frontend
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]
