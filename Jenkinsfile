pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
        SONAR_HOST = 'http://sonarqube:9000'
        SONAR_TOKEN = credentials('sonarqube-token')
        KUBE_CONFIG = credentials('kubeconfig')
        PROJECT_NAME = 'cityfix'
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.BUILD_TAG = "${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
                }
            }
        }
        
        stage('Build Services') {
            parallel {
                stage('Build AuthService') {
                    steps {
                        dir('src/AuthService') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/auth-service:${BUILD_TAG} .'
                        }
                    }
                }
                stage('Build AdminService') {
                    steps {
                        dir('src/AdminService') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/admin-service:${BUILD_TAG} .'
                        }
                    }
                }
                stage('Build TicketService') {
                    steps {
                        dir('src/TicketService') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/ticket-service:${BUILD_TAG} .'
                        }
                    }
                }
                stage('Build MediaService') {
                    steps {
                        dir('src/MediaService') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/media-service:${BUILD_TAG} .'
                        }
                    }
                }
                stage('Build GeoService') {
                    steps {
                        dir('src/GeoService') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/geo-service:${BUILD_TAG} .'
                        }
                    }
                }
                stage('Build NotificationService') {
                    steps {
                        dir('src/NotificationService') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/notification-service:${BUILD_TAG} .'
                        }
                    }
                }
                stage('Build Orchestrator') {
                    steps {
                        dir('src/Orchestrator') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/orchestrator:${BUILD_TAG} .'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('src/CityFixUI') {
                            sh 'docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/frontend:${BUILD_TAG} .'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Test Backend Services') {
                    steps {
                        script {
                            def services = ['AuthService', 'AdminService', 'TicketService', 'MediaService', 'GeoService', 'NotificationService', 'Orchestrator']
                            services.each { service ->
                                dir("src/${service}") {
                                    sh '''
                                        python3 -m venv venv
                                        . venv/bin/activate
                                        pip install -r requirements.txt
                                        pytest --cov=src --cov-report=xml || true
                                    '''
                                }
                            }
                        }
                    }
                }
                stage('Test Frontend') {
                    steps {
                        dir('src/CityFixUI') {
                            sh '''
                                npm ci
                                npm test -- --run --coverage || true
                            '''
                        }
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=cityfix \
                            -Dsonar.projectName=CityFix \
                            -Dsonar.sources=src \
                            -Dsonar.exclusions=**/node_modules/**,**/venv/**,**/__pycache__/** \
                            -Dsonar.python.coverage.reportPaths=**/coverage.xml \
                            -Dsonar.javascript.lcov.reportPaths=**/coverage/lcov.info
                        """
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Push Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-hub-credentials') {
                        def services = [
                            'auth-service',
                            'admin-service',
                            'ticket-service',
                            'media-service',
                            'geo-service',
                            'notification-service',
                            'orchestrator',
                            'frontend'
                        ]
                        
                        services.each { service ->
                            sh "docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${service}:${BUILD_TAG}"
                            
                            if (env.BRANCH_NAME == 'main') {
                                sh """
                                    docker tag ${DOCKER_REGISTRY}/${PROJECT_NAME}/${service}:${BUILD_TAG} \
                                               ${DOCKER_REGISTRY}/${PROJECT_NAME}/${service}:latest
                                    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${service}:latest
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def overlay = env.BRANCH_NAME == 'main' ? 'prod' : 'dev'
                    
                    sh """
                        export KUBECONFIG=${KUBE_CONFIG}
                        cd kubernetes/overlays/${overlay}
                        kustomize edit set image auth-service=${DOCKER_REGISTRY}/${PROJECT_NAME}/auth-service:${BUILD_TAG}
                        kustomize edit set image admin-service=${DOCKER_REGISTRY}/${PROJECT_NAME}/admin-service:${BUILD_TAG}
                        kustomize edit set image ticket-service=${DOCKER_REGISTRY}/${PROJECT_NAME}/ticket-service:${BUILD_TAG}
                        kustomize edit set image media-service=${DOCKER_REGISTRY}/${PROJECT_NAME}/media-service:${BUILD_TAG}
                        kustomize edit set image geo-service=${DOCKER_REGISTRY}/${PROJECT_NAME}/geo-service:${BUILD_TAG}
                        kustomize edit set image notification-service=${DOCKER_REGISTRY}/${PROJECT_NAME}/notification-service:${BUILD_TAG}
                        kustomize edit set image orchestrator=${DOCKER_REGISTRY}/${PROJECT_NAME}/orchestrator:${BUILD_TAG}
                        kustomize edit set image frontend=${DOCKER_REGISTRY}/${PROJECT_NAME}/frontend:${BUILD_TAG}
                        kubectl apply -k .
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    sh """
                        export KUBECONFIG=${KUBE_CONFIG}
                        kubectl rollout status deployment/auth-service -n cityfix --timeout=5m
                        kubectl rollout status deployment/admin-service -n cityfix --timeout=5m
                        kubectl rollout status deployment/ticket-service -n cityfix --timeout=5m
                        kubectl rollout status deployment/media-service -n cityfix --timeout=5m
                        kubectl rollout status deployment/geo-service -n cityfix --timeout=5m
                        kubectl rollout status deployment/notification-service -n cityfix --timeout=5m
                        kubectl rollout status deployment/orchestrator -n cityfix --timeout=5m
                        kubectl rollout status deployment/frontend -n cityfix --timeout=5m
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            // Send notification (email, Slack, etc.)
        }
        failure {
            echo '❌ Pipeline failed!'
            script {
                if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'develop') {
                    sh """
                        export KUBECONFIG=${KUBE_CONFIG}
                        kubectl rollout undo deployment/auth-service -n cityfix || true
                        kubectl rollout undo deployment/admin-service -n cityfix || true
                        kubectl rollout undo deployment/ticket-service -n cityfix || true
                        kubectl rollout undo deployment/media-service -n cityfix || true
                        kubectl rollout undo deployment/geo-service -n cityfix || true
                        kubectl rollout undo deployment/notification-service -n cityfix || true
                        kubectl rollout undo deployment/orchestrator -n cityfix || true
                        kubectl rollout undo deployment/frontend -n cityfix || true
                    """
                }
            }
            // Send notification
        }
        always {
            cleanWs()
        }
    }
}
