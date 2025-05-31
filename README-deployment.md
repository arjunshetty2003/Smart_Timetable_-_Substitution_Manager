# Deployment Guide - Smart Timetable & Substitution Manager

This document provides instructions for deploying the Smart Timetable & Substitution Manager application using Docker and Jenkins.

## Prerequisites

- Docker and Docker Compose installed
- Jenkins server (for CI/CD pipeline)
- MongoDB instance (or Docker-based MongoDB)
- Node.js environment for local development

## Deployment Options

### 1. Using Docker Compose (Quick Start)

The easiest way to deploy the application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd Smart_Timetable_\&_Substitution_Manager

# Update environment variables in docker-compose.yml (or use .env file)

# Start the application
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

### 2. Using the Dockerfile Directly

You can also build and run the Docker image directly:

```bash
# Build the Docker image
docker build -t smart-timetable:latest .

# Run the container
docker run -d \
  -p 3001:3001 \
  -p 5173:5173 \
  -e MONGO_URI=mongodb://your-mongodb-uri \
  -e JWT_SECRET=your-jwt-secret \
  --name smart-timetable \
  smart-timetable:latest
```

### 3. CI/CD with Jenkins

This project includes a Jenkinsfile for CI/CD. To use it:

1. Set up a Jenkins server with Docker and Node.js
2. Create a new Pipeline job in Jenkins
3. Configure the job to use the Git repository and the Jenkinsfile
4. Add the following credentials to Jenkins:
   - `docker-credentials` - Docker Hub credentials
   - `mongo-uri` - MongoDB connection string
   - `jwt-secret` - JWT secret key
   - `mongo-uri-staging` - MongoDB connection string for staging
   - `jwt-secret-staging` - JWT secret key for staging

The pipeline will:
- Build and test the application
- Build a Docker image
- Push the image to Docker Hub
- Deploy to staging
- Run integration tests
- Deploy to production (with manual approval)

## Environment Variables

| Variable     | Description                         | Default                              |
|--------------|-------------------------------------|--------------------------------------|
| NODE_ENV     | Application environment             | production                           |
| PORT         | Backend port                        | 3001                                 |
| MONGO_URI    | MongoDB connection string           | mongodb://localhost:27017/timetable_db |
| JWT_SECRET   | Secret for JWT token generation     | default_jwt_secret                   |
| JWT_EXPIRE   | JWT token expiration                | 30d                                  |

## MongoDB Setup

For a production deployment, you should:
1. Use a managed MongoDB service like MongoDB Atlas
2. Secure your MongoDB with authentication
3. Configure the MONGO_URI environment variable with the correct connection string

## Scaling and Production Considerations

For production deployments:
1. Use a proper reverse proxy (Nginx, Traefik)
2. Set up SSL/TLS for secure connections
3. Configure proper logging and monitoring
4. Use separate services for frontend and backend
5. Consider using Kubernetes for large-scale deployments

## Troubleshooting

If you encounter issues:
1. Check the container logs: `docker logs smart-timetable`
2. Verify MongoDB connection: `docker logs timetable-mongodb`
3. Check the health endpoint: `curl http://localhost:3001/api/health`

## Backup and Restore

To backup the MongoDB data:
```bash
docker exec -it timetable-mongodb mongodump --out /data/backup
```

To restore from backup:
```bash
docker exec -it timetable-mongodb mongorestore /data/backup
``` 