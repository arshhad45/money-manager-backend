pipeline {
  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume
  - name: docker
    image: docker:dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume
  - name: tools
    image: alpine/k8s:1.28.0
    command:
    - sleep
    args:
    - infinity
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume
  volumes:
  - name: workspace-volume
    emptyDir: {}
"""
    }
  }

  environment {
    AWS_ACCOUNT_ID        = '481665097478'
    AWS_REGION            = 'us-east-1'
    CLUSTER_NAME          = 'devops-cluster'
    BACKEND_REPO          = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/devops-app-backend"
    AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    MONGO_URI             = credentials('MONGO_URI')
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
        container('docker') {
          sh """
            sleep 5
            docker info

            apk add --no-cache aws-cli

            export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
            export AWS_DEFAULT_REGION=${AWS_REGION}

            aws ecr get-login-password --region ${AWS_REGION} | \
            docker login --username AWS --password-stdin \
            ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

            docker build -t ${BACKEND_REPO}:${BUILD_NUMBER} .
            docker tag ${BACKEND_REPO}:${BUILD_NUMBER} ${BACKEND_REPO}:latest
            docker push ${BACKEND_REPO}:${BUILD_NUMBER}
            docker push ${BACKEND_REPO}:latest

            echo "✅ Image pushed to ECR successfully!"
          """
        }
      }
    }

    stage('🚀 Deploy to EKS') {
      steps {
        container('tools') {
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

            cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ${BACKEND_REPO}:${BUILD_NUMBER}
        ports:
        - containerPort: 4000
        env:
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: MONGO_URI
        - name: PORT
          value: "4000"
        - name: NODE_ENV
          value: "production"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /api/health
            port: 4000
          initialDelaySeconds: 20
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - port: 4000
    targetPort: 4000
EOF

            kubectl rollout status deployment/backend -n production --timeout=5m
            echo "✅ Backend deployed successfully!"
          """
        }
      }
    }

    stage('✅ Verify') {
      steps {
        container('tools') {
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
  }

  post {
    success { echo '✅ Backend pipeline completed successfully!' }
    failure { echo '❌ Backend pipeline failed!' }
  }
}