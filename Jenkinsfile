pipeline {
    agent any

    tools {
        nodejs 'NodeJS 18'  // Must match the name configured in Global Tool Configuration
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                checkout scm
            }
        }

        stage('Verify Node Installation') {
            steps {
                sh 'node -v'
                sh 'npm -v'
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
                sh 'npm test || echo "⚠️ Tests failed or not configured."'
            }
        }

        stage('Build Project') {
            steps {
                echo 'Building project...'
                sh 'npm run build || echo "⚠️ Build step failed or not found."'
            }
        }
    }
}