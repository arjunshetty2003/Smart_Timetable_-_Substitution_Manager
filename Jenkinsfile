pipeline {
    agent any

    environment {
        CI = 'true'
    }

    stages {
        stage('Install Node.js 22') {
            steps {
                script {
                    // Install nvm if it's not already installed
                    def nvmInstalled = sh(script: 'command -v nvm', returnStatus: true)
                    if (nvmInstalled != 0) {
                        sh 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash'
                        sh 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"'
                    }
                    
                    // Install Node.js 22 using nvm
                    sh 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 22'
                    sh 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 22'
                    sh 'node -v'  // Check installed Node version
                }
            }
        }

        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                git 'https://github.com/arjunshetty2003/Smart_Timetable_-_Substitution_Manager.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh 'npm test'
            }
        }

        stage('Build Project') {
            steps {
                echo 'Building project...'
                sh 'npm run build'
            }
        }
    }
}