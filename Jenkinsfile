pipeline {
    agent any
    
    environment {
        // Define environment variables
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_REPO = 'yourusername/smart-timetable'
        DOCKER_CREDS_ID = 'docker-credentials'
        APP_VERSION = "${env.BUILD_NUMBER}"
        
        // MongoDB connection (use Jenkins credentials in production)
        MONGO_URI = credentials('mongo-uri')
        JWT_SECRET = credentials('jwt-secret')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Lint') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test || true'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test || true'
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                // Build Docker image
                script {
                    dockerImage = docker.build("${DOCKER_REPO}:${APP_VERSION}", ".")
                }
            }
        }
        
        stage('Push') {
            when {
                branch 'main'
            }
            steps {
                // Push to Docker registry
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDS_ID) {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                // Example using Docker Compose for staging deployment
                withCredentials([
                    string(credentialsId: 'mongo-uri-staging', variable: 'MONGO_URI'),
                    string(credentialsId: 'jwt-secret-staging', variable: 'JWT_SECRET')
                ]) {
                    sh """
                    docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
                    """
                }
            }
        }

        stage('Integration Tests') {
            when {
                branch 'main'
            }
            steps {
                // Run integration tests against the staging environment
                sh 'echo "Running integration tests"'
                // Add actual integration test commands here
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message "Deploy to production?"
                ok "Yes, deploy it!"
            }
            steps {
                // Example deployment to production
                sh 'echo "Deploying to production..."'
                // Add production deployment commands here
            }
        }
    }

    post {
        always {
            // Clean up
            sh 'docker-compose down || true'
            sh 'docker system prune -f || true'
            cleanWs()
        }
        success {
            echo 'Build, test and deployment successful!'
        }
        failure {
            echo 'Pipeline failed!'
            // Notify team about failure
            // mail to: 'team@example.com', subject: 'Pipeline failed!', body: "Something went wrong with build ${env.BUILD_NUMBER}"
        }
    }
}