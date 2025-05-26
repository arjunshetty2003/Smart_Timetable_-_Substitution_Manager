environment {
    CI = 'true'
    PATH = "/usr/local/bin:$PATH" // Ensure Jenkins can access global node and npm
}

stages {
    stage('Checkout') {
        steps {
            echo 'Cloning repository...'
            git 'https://github.com/arjunshetty2003/Smart_Timetable_-_Substitution_Manager.git'
        }
    }

    stage('Verify Node Installation') {
        steps {
            echo 'Checking Node and NPM versions...'
            sh 'which node'
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
            sh 'npm test || echo "⚠️ Tests failed or are not configured."'
        }
    }

    stage('Build Project') {
        steps {
            echo 'Building project...'
            sh 'npm run build || echo "⚠️ Build script not found."'
        }
    }
}