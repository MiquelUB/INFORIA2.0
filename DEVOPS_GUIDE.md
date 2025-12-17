# 🐳 Guía de DevOps y Contenedores - INFORIA 2.0

**Proyecto**: INFORIA 2.0  
**Stack**: Next.js 14 + TypeScript + Supabase  
**Fecha**: 2025-12-17

---

## 📦 Extensiones DevOps Instaladas

### **Docker** (1)
- ✅ `ms-azuretools.vscode-docker` - Gestión completa de Docker

### **Kubernetes** (1)
- ✅ `ms-kubernetes-tools.vscode-kubernetes-tools` - Gestión de clusters K8s

### **CI/CD** (1)
- ✅ `github.vscode-github-actions` - GitHub Actions workflows

### **Infrastructure as Code** (1)
- ✅ `hashicorp.terraform` - Terraform HCL

### **YAML** (1)
- ✅ `redhat.vscode-yaml` - Soporte completo para YAML

### **Contenedores** (1)
- ✅ `ms-vscode-remote.remote-containers` - Dev Containers

---

## 🐳 Docker

### **Dockerfile para Next.js**

Crea un archivo `Dockerfile` en la raíz del proyecto:

```dockerfile
# Dockerfile para INFORIA 2.0
FROM node:22-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Reconstruir el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### **.dockerignore**

```
# Dependencias
node_modules
npm-debug.log

# Next.js
.next
out
*.tsbuildinfo

# Entorno
.env
.env.local
.env.*.local

# Git
.git
.gitignore

# IDE
.vscode
.idea

# Testing
coverage
.nyc_output

# Misc
.DS_Store
*.log
README.md
```

### **docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    env_file:
      - .env.local
    restart: unless-stopped
    networks:
      - inforia-network

networks:
  inforia-network:
    driver: bridge
```

### **Comandos Docker Útiles**

```powershell
# Construir imagen
docker build -t inforia:latest .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env.local inforia:latest

# Ejecutar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener contenedores
docker-compose down

# Reconstruir y ejecutar
docker-compose up --build -d

# Limpiar imágenes no usadas
docker system prune -a
```

---

## ☸️ Kubernetes

### **deployment.yaml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inforia-deployment
  labels:
    app: inforia
spec:
  replicas: 3
  selector:
    matchLabels:
      app: inforia
  template:
    metadata:
      labels:
        app: inforia
    spec:
      containers:
      - name: inforia
        image: inforia:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: inforia-secrets
              key: supabase-url
        - name: NEXT_PUBLIC_SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: inforia-secrets
              key: supabase-anon-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### **service.yaml**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: inforia-service
spec:
  type: LoadBalancer
  selector:
    app: inforia
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

### **Comandos Kubernetes**

```powershell
# Aplicar configuración
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Ver pods
kubectl get pods

# Ver servicios
kubectl get services

# Ver logs
kubectl logs -f <pod-name>

# Escalar deployment
kubectl scale deployment inforia-deployment --replicas=5

# Ver estado del deployment
kubectl rollout status deployment/inforia-deployment

# Rollback
kubectl rollout undo deployment/inforia-deployment
```

---

## 🔄 GitHub Actions

### **.github/workflows/ci.yml**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Type check
      run: npx tsc --noEmit
    
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### **.github/workflows/docker.yml**

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  docker:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: inforia/app
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

---

## 🏗️ Terraform (Infrastructure as Code)

### **main.tf**

```hcl
terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

resource "vercel_project" "inforia" {
  name      = "inforia"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "MiquelUB/INFORIA2.0"
  }
}

resource "vercel_project_environment_variable" "supabase_url" {
  project_id = vercel_project.inforia.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = var.supabase_url
  target     = ["production", "preview"]
}

resource "vercel_project_environment_variable" "supabase_anon_key" {
  project_id = vercel_project.inforia.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = var.supabase_anon_key
  target     = ["production", "preview"]
  sensitive  = true
}
```

### **variables.tf**

```hcl
variable "vercel_api_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase Project URL"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase Anonymous Key"
  type        = string
  sensitive   = true
}
```

---

## 📊 Monitoreo y Logs

### **Health Check API Route**

Crea `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
}
```

---

## 🔐 Secrets Management

### **GitHub Secrets Necesarios**

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DOCKER_USERNAME
DOCKER_PASSWORD
```

### **Comandos para agregar secrets**

```powershell
# GitHub CLI
gh secret set VERCEL_TOKEN

# Kubernetes
kubectl create secret generic inforia-secrets \
  --from-literal=supabase-url=$SUPABASE_URL \
  --from-literal=supabase-anon-key=$SUPABASE_ANON_KEY
```

---

## 🚀 Despliegue

### **Vercel (Recomendado para INFORIA)**

```powershell
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy a preview
vercel

# Deploy a producción
vercel --prod
```

### **Docker**

```powershell
# Build
docker build -t inforia:v1.0.0 .

# Run
docker run -p 3000:3000 --env-file .env.local inforia:v1.0.0
```

### **Kubernetes**

```powershell
# Aplicar todos los manifests
kubectl apply -f k8s/

# Ver estado
kubectl get all
```

---

## 📝 Mejores Prácticas

1. **Usa multi-stage builds** en Docker para imágenes más pequeñas
2. **Implementa health checks** en todos los contenedores
3. **Usa secrets** para información sensible, nunca en código
4. **Implementa CI/CD** para automatizar testing y deployment
5. **Monitorea** tus aplicaciones con logs y métricas
6. **Usa tags semánticos** para versionar tus imágenes Docker
7. **Implementa rollback automático** en caso de fallos

---

**Última actualización**: 2025-12-17
