FROM node:20

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create a .env file with defaults (will be overridden by environment variables)
RUN echo "NODE_ENV=development" > ./.env \
    && echo "PORT=5001" >> ./.env \
    && echo "MONGO_URI=mongodb://admin:password@mongodb:27017/timetable_db?authSource=admin" >> ./.env \
    && echo "JWT_SECRET=default_jwt_secret_replace_in_development" >> ./.env

# Expose the API port
EXPOSE 5001

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

# Start the server
CMD ["npm", "start"]
