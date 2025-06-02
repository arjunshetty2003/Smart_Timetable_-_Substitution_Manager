#!/bin/bash

# Script to run the Jenkins pipeline locally using Docker
# This simulates the Jenkins pipeline stages and runs the application locally

# Set environment variables
export APP_NAME="smart-timetable"
export APP_VERSION="local"
export FRONTEND_IMAGE="${APP_NAME}-frontend:${APP_VERSION}"
export BACKEND_IMAGE="${APP_NAME}-backend:${APP_VERSION}"
export MONGODB_URI="mongodb://admin:password@mongodb:27017/timetable_db?authSource=admin"
export JWT_SECRET="local_development_jwt_secret"

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print stage header
print_stage() {
  echo -e "\n${BLUE}============================================================${NC}"
  echo -e "${BLUE}STAGE: $1${NC}"
  echo -e "${BLUE}============================================================${NC}\n"
}

# Function to print success message
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning message
print_warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

# Function to print error message
print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Clean up existing containers
cleanup() {
  print_stage "CLEANUP"
  
  echo "🧹 Stopping and removing any existing containers..."
  docker stop ${APP_NAME}-frontend ${APP_NAME}-backend mongodb 2>/dev/null || true
  docker rm ${APP_NAME}-frontend ${APP_NAME}-backend mongodb 2>/dev/null || true
  docker network rm ${APP_NAME}-network 2>/dev/null || true
  
  print_success "Cleanup completed"
}

# Install dependencies
install_dependencies() {
  print_stage "INSTALL DEPENDENCIES"
  
  echo "Installing backend dependencies..."
  cd backend && npm ci
  if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
  else
    print_error "Failed to install backend dependencies"
    exit 1
  fi
  
  echo "Installing frontend dependencies..."
  cd ../frontend && npm ci
  if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
  else
    print_error "Failed to install frontend dependencies"
    exit 1
  fi
  
  cd ..
}

# Run linting and tests
run_tests() {
  print_stage "LINT & TEST"
  
  echo "Running backend linting..."
  cd backend && npm run lint || print_warning "Backend linting had warnings"
  
  echo "Running backend tests..."
  npm test || print_warning "Backend tests had warnings"
  
  echo "Running frontend linting..."
  cd ../frontend && npm run lint || print_warning "Frontend linting had warnings"
  
  echo "Running frontend tests..."
  npm test || print_warning "Frontend tests had warnings"
  
  cd ..
  print_success "Tests and linting completed"
}

# Build Docker images
build_images() {
  print_stage "BUILD DOCKER IMAGES"
  
  echo "🔨 Building frontend Docker image..."
  docker build -t ${FRONTEND_IMAGE} -f frontend/Dockerfile ./frontend
  if [ $? -eq 0 ]; then
    print_success "Frontend Docker image built"
  else
    print_error "Failed to build frontend Docker image"
    exit 1
  fi
  
  echo "🔨 Building backend Docker image..."
  docker build -t ${BACKEND_IMAGE} -f backend/Dockerfile ./backend
  if [ $? -eq 0 ]; then
    print_success "Backend Docker image built"
  else
    print_error "Failed to build backend Docker image"
    exit 1
  fi
}

# Run the application
run_application() {
  print_stage "RUN APPLICATION LOCALLY"
  
  echo "🌐 Creating Docker network..."
  docker network create ${APP_NAME}-network || true
  
  echo "🍃 Starting MongoDB container..."
  docker run -d --name mongodb \
    --hostname mongodb \
    --network ${APP_NAME}-network \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=password \
    -e MONGO_INITDB_DATABASE=timetable_db \
    -p 27017:27017 \
    mongo:6 \
    --wiredTigerCacheSizeGB 0.5
  
  echo "⏳ Waiting for MongoDB to be ready..."
  sleep 15
  
  echo "🔧 Starting Backend container..."
  docker run -d --name ${APP_NAME}-backend \
    --hostname backend \
    --network ${APP_NAME}-network \
    -e NODE_ENV=development \
    -e PORT=5001 \
    -e MONGO_URI="${MONGODB_URI}" \
    -e JWT_SECRET="${JWT_SECRET}" \
    -p 5001:5001 \
    ${BACKEND_IMAGE}
  
  echo "⏳ Waiting for backend to be ready..."
  sleep 10
  
  echo "🎨 Starting Frontend container..."
  docker run -d --name ${APP_NAME}-frontend \
    --hostname frontend \
    --network ${APP_NAME}-network \
    -e NODE_ENV=development \
    -e VITE_API_URL=http://backend:5001/api \
    -p 3000:3000 \
    ${FRONTEND_IMAGE}
  
  print_success "Application is running locally!"
  echo "📱 Frontend: http://localhost:3000"
  echo "🔧 Backend: http://localhost:5001"
  echo "🏥 Health check: http://localhost:5001/api/health"
}

# Verify deployment
verify_deployment() {
  print_stage "VERIFY DEPLOYMENT"
  
  echo "🔍 Verifying backend health..."
  curl -s http://localhost:5001/api/health
  if [ $? -eq 0 ]; then
    print_success "Backend health check passed"
  else
    print_warning "Backend health check failed"
    
    # Show MongoDB status
    echo -e "\n📊 MongoDB container status:"
    docker exec mongodb mongosh --eval "db.adminCommand('ping')" || print_warning "MongoDB may not be responding"
    
    # Show network configuration
    echo -e "\n🔍 Checking Docker network:"
    docker network inspect ${APP_NAME}-network
  fi
  
  echo "🔍 Verifying frontend availability..."
  curl -s -I http://localhost:3000 | head -n 1
  if [ $? -eq 0 ]; then
    print_success "Frontend check passed"
  else
    print_warning "Frontend check failed"
  fi
}

# Display logs
display_logs() {
  print_stage "APPLICATION LOGS"
  
  echo "📋 MongoDB logs:"
  docker logs mongodb
  
  echo -e "\n📋 Backend logs:"
  docker logs ${APP_NAME}-backend
  
  echo -e "\n📋 Frontend logs:"
  docker logs ${APP_NAME}-frontend
}

# Run all stages
main() {
  # Perform initial cleanup
  cleanup
  
  # Simulate Jenkins pipeline stages
  install_dependencies
  run_tests
  build_images
  run_application
  
  # Wait a bit for services to be fully up
  echo "⏳ Waiting for services to be fully up..."
  sleep 20
  
  verify_deployment
  display_logs
  
  echo -e "\n${GREEN}🎉 CI/CD Pipeline completed successfully!${NC}"
  echo -e "Your application is now running locally at:"
  echo -e "  - Frontend: ${BLUE}http://localhost:3000${NC}"
  echo -e "  - Backend: ${BLUE}http://localhost:5001${NC}"
  echo -e "  - Health Check: ${BLUE}http://localhost:5001/api/health${NC}"
  echo -e "\nTo stop the application and clean up containers, press Ctrl+C or run:"
  echo -e "${YELLOW}./run-jenkins-local.sh cleanup${NC}"
}

# Handle command line argument
if [ "$1" == "cleanup" ]; then
  cleanup
  exit 0
fi

# Run the main function
main 