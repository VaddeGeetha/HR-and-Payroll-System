pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    environment {
        SUPABASE_URL = credentials('SUPABASE_URL')
        SUPABASE_ANON_KEY = credentials('SUPABASE_ANON_KEY')
        SUPABASE_SERVICE_ROLE_KEY = credentials('SUPABASE_SERVICE_ROLE_KEY')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
    steps {
        sh 'npm test'
    }
}

        stage('Deploy') {
            steps {
                sh 'docker buildx build --load -t hr-payroll .'
                sh 'docker stop hr-payroll || true'
                sh 'docker rm hr-payroll || true'
                sh 'docker run -d --name hr-payroll -p 5000:5000 -e SUPABASE_URL="$SUPABASE_URL" -e SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" hr-payroll'
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
