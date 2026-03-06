pipeline {
  agent any

  environment {
    AWS_ACCOUNT_ID      = '481665097478'
    AWS_REGION          = 'us-east-1'
    CLUSTER_NAME        = 'devops-cluster'
    BACKEND_REPO        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/devops-app-backend"
    AWS_ACCESS_KEY_ID   = credentials('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    MONGO_URI           = credentials('MONGO_URI')
  }

  stages {

    stage('📥 Checkout') {
      steps {
        checkout scm
        echo "✅ Code checked out — Build #${BUILD_NUMBER}"
      }
    }

    stage('🐳 Build & Push to ECR') {
      steps {
        sh """
          # Install required tools
          apt-get update -qq && apt-get install -y docker.io awscli || \
          yum install -y docker awscli || \
          apk add --no-cache docker aws-cli || true

          # Configure AWS
          export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
          export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
          export AWS_DEFAULT_REGION=${AWS_REGION}

          # Login to ECR
          aws ecr get-login-password --region ${AWS_REGION} | \
          docker login --username AWS --password-stdin \
          ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

          # Build and push
          docker build -t ${BACKEND_REPO}:${BUILD_NUMBER} .
          docker tag ${BACKEND_REPO}:${BUILD_NUMBER} ${BACKEND_REPO}:latest
          docker push ${BACKEND_REPO}:${BUILD_NUMBER}
          docker push ${BACKEND_REPO}:latest
        """
      }
    }

    stage('🚀 Deploy to EKS') {
      steps {
        sh """
          export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
          export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
          export AWS_DEFAULT_REGION=${AWS_REGION}

          aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}

          kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -

          kubectl create secret generic app-secrets \
            --from-literal=MONGO_URI=${MONGO_URI} \
            --namespace production \
            --dry-run=client -o yaml | kubectl apply -f -

          kubectl create deployment backend \
            --image=${BACKEND_REPO}:${BUILD_NUMBER} \
            --namespace production \
            --dry-run=client -o yaml | kubectl apply -f -

          kubectl set image deployment/backend \
            backend=${BACKEND_REPO}:${BUILD_NUMBER} \
            -n production

          kubectl expose deployment backend \
            --port=4000 \
            --target-port=4000 \
            --name=backend-service \
            --namespace production \
            --dry-run=client -o yaml | kubectl apply -f -

          kubectl rollout status deployment/backend \
            -n production --timeout=5m
        """
      }
    }

    stage('✅ Verify') {
      steps {
        sh """
          export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
          export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
          export AWS_DEFAULT_REGION=${AWS_REGION}
          kubectl get pods -n production
          kubectl get svc -n production
        """
      }
    }
  }

  post {
    success { echo '✅ Backend deployed successfully!' }
    failure { echo '❌ Backend deploy failed!' }
  }
}