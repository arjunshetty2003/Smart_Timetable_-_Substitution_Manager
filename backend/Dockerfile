# Use Node.js v20.18.1 Alpine as base
FROM node:20.18.1-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Set NODE_ENV
ENV NODE_ENV=production

# Create .env file with default values (will be overridden by environment variables)
RUN echo "NODE_ENV=production" > .env \
    && echo "PORT=5001" >> .env \
    && echo "MONGO_URI=mongodb+srv://new_user_31:us7WCnGiy20HS0wW@cluster0.ymz2b.mongodb.net/smart_timetable?retryWrites=true&w=majority&appName=Cluster0" >> .env \
    && echo "JWT_SECRET=smart_timetable_jwt_secret_key_2024_secure_token" >> .env \
    && echo "JWT_EXPIRE=30d" >> .env \
    && echo "JWT_COOKIE_EXPIRE=30" >> .env

# Expose port 5001
EXPOSE 5001

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:5001/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
