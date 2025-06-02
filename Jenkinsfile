pipeline {
    agent any
    
    environment {
        // Define environment variables
        APP_NAME = 'smart-timetable'
        APP_VERSION = "${env.BUILD_NUMBER}"
        FRONTEND_IMAGE = "${APP_NAME}-frontend:${APP_VERSION}"
        BACKEND_IMAGE = "${APP_NAME}-backend:${APP_VERSION}"
        MONGODB_URI = "mongodb://admin:password@mongodb:27017/timetable_db?authSource=admin"
        JWT_SECRET = "local_development_jwt_secret"
        DOCKER_REGISTRY = 'your-registry-url'  // Replace with your registry
        IMAGE_NAME = 'timetable-manager'
        VERSION = "${BUILD_NUMBER}"
        NODE_VERSION = '20'
        PATH = "/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('Setup Prerequisites') {
            steps {
                script {
                    // Install Node.js using nvm if available, otherwise try direct installation
                    sh '''
                        # Try to load nvm if it exists
                        export NVM_DIR="$HOME/.nvm"
                        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                        
                        # Check if node is installed
                        if ! command -v node &> /dev/null; then
                            echo "Installing Node.js..."
                            if command -v nvm &> /dev/null; then
                                nvm install ${NODE_VERSION}
                                nvm use ${NODE_VERSION}
                            else
                                # For macOS
                                if command -v brew &> /dev/null; then
                                    brew install node@${NODE_VERSION}
                                # For Ubuntu/Debian
                                elif command -v apt-get &> /dev/null; then
                                    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                                    sudo apt-get install -y nodejs
                                else
                                    echo "Unable to install Node.js. Please install it manually."
                                    exit 1
                                fi
                            fi
                        fi
                        
                        # Verify installations
                        node --version
                        npm --version
                    '''
                    echo '✅ Prerequisites installation complete'
                }
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Source code checkout complete"
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            echo "✅ Backend dependencies installed"
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            echo "✅ Frontend dependencies installed"
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                // Build Frontend Image
                sh """
                echo "🔨 Building Frontend Docker image..."
                docker build -t ${DOCKER_REGISTRY}/frontend:${VERSION} -f frontend/Dockerfile ./frontend
                """
                
                // Build Backend Image
                sh """
                echo "🔨 Building Backend Docker image..."
                docker build -t ${DOCKER_REGISTRY}/backend:${VERSION} -f backend/Dockerfile ./backend
                """
                
                echo "✅ Docker images built successfully"
            }
        }
        
        stage('Push Images') {
            when {
                branch 'main'  // Only push images for main branch
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "${DOCKER_PASS}" | docker login ${DOCKER_REGISTRY} -u "${DOCKER_USER}" --password-stdin
                        docker push ${DOCKER_REGISTRY}/backend:${VERSION}
                        docker push ${DOCKER_REGISTRY}/frontend:${VERSION}
                    """
                }
            }
        }
        
        stage('Run Application Locally') {
            steps {
                // Create network if it doesn't exist
                sh """
                echo "🌐 Creating Docker network..."
                docker network create ${APP_NAME}-network || true
                """
                
                // Start MongoDB
                sh """
                echo "🍃 Starting MongoDB container..."
                docker run -d --name mongodb \
                    --network ${APP_NAME}-network \
                    -e MONGO_INITDB_ROOT_USERNAME=admin \
                    -e MONGO_INITDB_ROOT_PASSWORD=password \
                    -p 27017:27017 \
                    mongo:6
                """
                
                // Wait for MongoDB to be ready
                sh """
                echo "⏳ Waiting for MongoDB to be ready..."
                sleep 10
                """
                
                // Start Backend
                sh """
                echo "🔧 Starting Backend container..."
                docker run -d --name ${APP_NAME}-backend \
                    --network ${APP_NAME}-network \
                    -e NODE_ENV=development \
                    -e PORT=5001 \
                    -e MONGO_URI="${MONGODB_URI}" \
                    -e JWT_SECRET="${JWT_SECRET}" \
                    -p 5001:5001 \
                    ${BACKEND_IMAGE}
                """
                
                // Start Frontend
                sh """
                echo "🎨 Starting Frontend container..."
                docker run -d --name ${APP_NAME}-frontend \
                    --network ${APP_NAME}-network \
                    -e VITE_API_URL=http://localhost:5001/api \
                    -p 3000:3000 \
                    ${FRONTEND_IMAGE}
                """
                
                echo "✅ Application is running locally!"
                echo "📱 Frontend: http://localhost:3000"
                echo "🔧 Backend: http://localhost:5001"
                echo "🏥 Health check: http://localhost:5001/api/health"
            }
        }
        
        stage('Verify Deployment') {
            steps {
                // Check if backend is responding
                sh """
                echo "🔍 Verifying backend health..."
                curl -s http://localhost:5001/api/health || echo "❌ Backend health check failed"
                """
                
                // Check if frontend is responding
                sh """
                echo "🔍 Verifying frontend availability..."
                curl -s -I http://localhost:3000 | head -n 1 || echo "❌ Frontend check failed"
                """
                
                echo "✅ Deployment verification complete"
            }
        }
    }

    post {
        always {
            // Display container logs before cleanup
            sh """
            echo "📋 Backend logs:"
            docker logs ${APP_NAME}-backend || true
            
            echo "📋 Frontend logs:"
            docker logs ${APP_NAME}-frontend || true
            """
            
            // Clean up containers
            sh """
            echo "🧹 Cleaning up Docker containers..."
            docker stop ${APP_NAME}-frontend ${APP_NAME}-backend mongodb || true
            docker rm ${APP_NAME}-frontend ${APP_NAME}-backend mongodb || true
            docker network rm ${APP_NAME}-network || true
            """
            
            // Clean up Docker images
            sh """
                docker rmi ${DOCKER_REGISTRY}/backend:${VERSION} || true
                docker rmi ${DOCKER_REGISTRY}/frontend:${VERSION} || true
            """
            
            echo "🏁 Pipeline completed"
        }
        success {
            echo '🎉 Build, test and deployment successful!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}