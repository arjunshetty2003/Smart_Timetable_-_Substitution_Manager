pipeline {
    agent any

    tools {
        nodejs "NodeJS 18" // Set this in Jenkins: Manage Jenkins → Global Tools
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/arjunshetty2003/Smart_Timetable_-_Substitution_Manager.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test' // Replace if you have a different test command
            }
        }

        stage('Build Project') {
            steps {
                sh 'npm run build' // Replace if you use another build command
            }
        }
    }
}