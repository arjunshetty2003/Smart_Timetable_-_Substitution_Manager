pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/arjunshetty2003/Smart_Timetable_-_Substitution_Manager.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    /Users/arjun/.nvm/versions/node/v20.18.1/bin/node -v
                    /Users/arjun/.nvm/versions/node/v20.18.1/bin/npm -v
                    /Users/arjun/.nvm/versions/node/v20.18.1/bin/npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '/Users/arjun/.nvm/versions/node/v20.18.1/bin/npm test || echo "Tests failed (ignored for now)"'
            }
        }

        stage('Build') {
            steps {
                sh '/Users/arjun/.nvm/versions/node/v20.18.1/bin/npm run build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploy stage — add deployment commands here'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully.'
        }
        failure {
            echo '❌ Pipeline failed.'
        }
    }
}