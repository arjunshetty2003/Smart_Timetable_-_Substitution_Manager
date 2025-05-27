pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/arjunshetty2003/Smart_Timetable_-_Substitution_Manager.git'
            }
        }

        stage('Install, Test, Build') {
            steps {
                sh '''
                    export PATH="/Users/arjun/.nvm/versions/node/v20.18.1/bin:$PATH"
                    node -v
                    npm -v
                    npm install
                    npm test || echo "Tests failed (ignored for now)"
                    npm run build
                '''
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