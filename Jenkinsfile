pipeline {
 agent any

 stages {

stage('Clone Backend Repo') {
    steps {
        git branch: 'main', url: 'https://github.com/arshhad45/money-manager-backend.git'
    }
}
  }

  stage('Install Dependencies') {
   steps {
    sh 'npm install'
   }
  }

  stage('Build Docker Image') {
   steps {
    sh 'docker build -t money-backend .'
   }
  }

  stage('Deploy Backend Container') {
   steps {
    sh 'docker rm -f backend-container || true'
    sh 'docker run -d -p 5000:5000 --name backend-container money-backend'
   }
  }

 }
}