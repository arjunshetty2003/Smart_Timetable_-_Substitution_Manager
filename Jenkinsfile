pipeline {
    agent any

    environment {
        CI = 'true'
    }

    stages {
        stage('Install Node.js 22') {
            steps {
                script {
                    // Check if Node.js 22 is installed
                    def nodeInstalled = sh(script: 'node -v', returnStatus: true)
                    if (nodeInstalled != 0) {
                        // Install Node.js 22 if not installed
                        sh 'curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -'
                        sh 'sudo apt-get install -y nodejs'
                    }
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