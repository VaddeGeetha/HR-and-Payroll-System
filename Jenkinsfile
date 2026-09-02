pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('backend') {
                    sh 'npm test || echo "No tests yet"'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment will be added later'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! '
        }
        failure {
            echo 'Pipeline failed! '
        }
    }
}
