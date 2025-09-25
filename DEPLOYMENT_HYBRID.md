# 🚀 Neurona Hybrid Deployment Guide

**Architecture**: Vercel (Frontend) + Google Cloud VM (Backend + Database)

This guide covers deploying the Neurona Mental Health Platform using a hybrid architecture where the frontend is hosted on Vercel and the backend runs on a Google Cloud VM with PostgreSQL and Redis.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │  Google Cloud VM │    │  Cloud SQL      │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Next.js App │ │◄──►│ │ Node.js API  │ │◄──►│ │ PostgreSQL  │ │
│ │ (Frontend)  │ │    │ │ (Backend)    │ │    │ │ (Database)  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    │ ┌──────────────┐ │    │ ┌─────────────┐ │
                       │ │   Nginx      │ │    │ │ Redis Cache │ │
                       │ │ (Reverse Proxy)│    │ │             │ │
                       │ └──────────────┘ │    │ └─────────────┘ │
                       └──────────────────┘    └─────────────────┘
```

**Domains**:
- Frontend: `https://neurona.health` (Vercel)
- Backend API: `https://api.neurona.health` (Google Cloud)

---

## 📋 Prerequisites

### Required Tools
- [Node.js 18+](https://nodejs.org/)
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
- [Terraform](https://developer.hashicorp.com/terraform/downloads)
- [Vercel CLI](https://vercel.com/docs/cli)
- Domain name with DNS control

### Required Accounts
- [Google Cloud Platform](https://cloud.google.com/) account
- [Vercel](https://vercel.com/) account
- [Resend](https://resend.com/) account for emails
- Domain registrar account

---

## 🔧 Part 1: Google Cloud Backend Setup

### Step 1: Configure Google Cloud Project

```bash
# Authenticate with Google Cloud
gcloud auth login

# Create a new project (optional)
gcloud projects create neurona-production --name="Neurona Mental Health"

# Set the project
gcloud config set project neurona-production

# Enable billing (required for compute resources)
gcloud billing projects link neurona-production --billing-account=YOUR_BILLING_ACCOUNT
```

### Step 2: Deploy Backend Infrastructure

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars file
cat > terraform.tfvars << EOF
project_id    = "neurona-production"
region        = "us-central1"
zone          = "us-central1-a"
environment   = "production"
domain_name   = "api.neurona.health"
db_password   = "your-secure-database-password"
EOF

# Plan the deployment
terraform plan -var-file="terraform.tfvars"

# Deploy the infrastructure
terraform apply -var-file="terraform.tfvars"
```

**What this creates**:
- Ubuntu VM with Node.js, Nginx, PM2, Docker
- Cloud SQL PostgreSQL database (private)
- Redis Memorystore instance
- Load balancer with SSL certificate
- VPC network with firewall rules
- IAM service accounts with proper permissions

### Step 3: Configure DNS

After Terraform completes, you'll get the load balancer IP:

```bash
# Get the load balancer IP
terraform output api_load_balancer_ip
```

Configure DNS:
1. Go to your domain registrar
2. Create an A record: `api.neurona.health` → `[LOAD_BALANCER_IP]`
3. Wait for DNS propagation (5-30 minutes)

### Step 4: Deploy Backend Code

SSH into your VM:

```bash
# Get VM IP
terraform output backend_ip

# SSH into the VM
gcloud compute ssh neurona-backend-production --zone=us-central1-a
```

Deploy the backend:

```bash
# Run the deployment script
sudo /opt/neurona/deploy.sh

# Configure environment variables
sudo nano /opt/neurona/.env
# Update JWT_SECRET and RESEND_API_KEY

# Setup SSL certificate
sudo /opt/neurona/setup-ssl.sh

# Check application status
pm2 status
pm2 logs neurona-backend

# Test the API
curl https://api.neurona.health/api/health
```

---

## 🌐 Part 2: Vercel Frontend Setup

### Step 1: Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Configure Vercel Project

```bash
# Initialize Vercel project (run from project root)
vercel

# Follow the prompts:
# - Link to existing project or create new: Create new
# - Project name: neurona-frontend
# - Directory: ./
# - Override build settings: No
```

### Step 3: Configure Environment Variables

In Vercel Dashboard (https://vercel.com/dashboard):

1. Go to your project → Settings → Environment Variables
2. Add these variables:

```bash
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://api.neurona.health
NEXT_PUBLIC_APP_URL=https://neurona.health
NEXTAUTH_URL=https://neurona.health
NEXTAUTH_SECRET=your-nextauth-secret-key
NODE_ENV=production
```

### Step 4: Configure Custom Domain

In Vercel Dashboard:

1. Go to your project → Settings → Domains
2. Add domain: `neurona.health`
3. Add domain: `www.neurona.health` (redirect to main)
4. Configure DNS as instructed by Vercel

### Step 5: Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Or use GitHub integration for automatic deployments
```

---

## ⚙️ Part 3: Configuration & Integration

### Frontend Configuration

Update your frontend API calls to use the backend URL:

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Backend CORS Configuration

Update backend CORS settings to allow Vercel domain:

```javascript
// backend/server.js
const corsOptions = {
  origin: [
    'https://neurona.health',
    'https://www.neurona.health',
    'http://localhost:3000' // for development
  ],
  credentials: true,
};
```

### Database Migrations

Run database migrations on your VM:

```bash
# SSH into VM
gcloud compute ssh neurona-backend-production

# Navigate to app directory
cd /opt/neurona

# Run migrations
npm run migrate

# Seed initial data (if needed)
npm run seed
```

---

## 🔒 Part 4: Security & Monitoring

### SSL Certificates

Both Vercel and Google Cloud provide automatic SSL:
- Vercel: Automatic SSL for all domains
- Google Cloud: Managed SSL certificates via Terraform

### Monitoring Setup

#### Backend Monitoring

```bash
# SSH into VM
gcloud compute ssh neurona-backend-production

# Check PM2 monitoring
pm2 monit

# Check system resources
htop

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check application logs
tail -f /var/log/neurona/combined.log
```

#### Frontend Monitoring

Vercel provides built-in monitoring:
- Go to Vercel Dashboard → Your Project → Analytics
- Monitor performance, errors, and traffic

### Security Checklist

- [ ] Database is in private network (no public IP)
- [ ] Redis requires authentication
- [ ] VM firewall only allows necessary ports
- [ ] SSL certificates are active on both domains
- [ ] Environment variables are secure
- [ ] Regular security updates scheduled

---

## 🚀 Part 5: CI/CD Setup

### GitHub Actions for Backend

The repository includes GitHub Actions for backend deployment. Configure these secrets:

```bash
# In GitHub repository → Settings → Secrets
GOOGLE_CLOUD_PROJECT_ID=neurona-production
GOOGLE_APPLICATION_CREDENTIALS=[Service Account JSON]
```

### GitHub Actions for Frontend

The repository includes Vercel deployment workflow. Configure these secrets:

```bash
# In GitHub repository → Settings → Secrets
VERCEL_TOKEN=[Your Vercel Token]
VERCEL_ORG_ID=[Your Org ID]
VERCEL_PROJECT_ID=[Your Project ID]
NEXTAUTH_SECRET=[Your NextAuth Secret]
```

---

## 🧪 Part 6: Testing Deployment

### Health Checks

```bash
# Test frontend
curl -I https://neurona.health

# Test backend API
curl https://api.neurona.health/api/health

# Test database connection
curl https://api.neurona.health/api/health/db
```

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API performance
ab -n 100 -c 10 https://api.neurona.health/api/health
```

---

## 📊 Part 7: Cost Optimization

### Google Cloud Costs

- **VM**: e2-standard-2 (~$50/month)
- **Cloud SQL**: db-standard-2 (~$100/month)
- **Redis**: 2GB HA (~$200/month)
- **Load Balancer**: ~$20/month
- **Total**: ~$370/month for production

### Vercel Costs

- **Pro Plan**: $20/month per user
- **Additional bandwidth**: Pay-as-you-go

### Cost Savings

- Use smaller VM instances for development
- Use Cloud SQL db-f1-micro for staging
- Use basic Redis tier for non-production

---

## 🔄 Part 8: Maintenance

### Regular Updates

```bash
# Update system packages (monthly)
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd /opt/neurona
npm audit fix
npm update

# Restart application
pm2 restart neurona-backend
```

### Backups

```bash
# Database backups are automatic via Cloud SQL
# Check backup status
gcloud sql backups list --instance=neurona-db-production

# Create manual backup
gcloud sql backups create --instance=neurona-db-production
```

### Log Rotation

Log rotation is configured automatically:
- Application logs: 7 days retention
- Nginx logs: 7 days retention
- System logs: Default retention

---

## 🆘 Troubleshooting

### Common Issues

#### Frontend can't reach backend

1. Check CORS configuration
2. Verify API URL environment variables
3. Check SSL certificates
4. Test API directly with curl

#### Database connection issues

1. Check VM network connectivity
2. Verify database credentials
3. Check Cloud SQL private IP
4. Review firewall rules

#### SSL certificate issues

1. Re-run `/opt/neurona/setup-ssl.sh`
2. Check DNS propagation
3. Verify Certbot configuration
4. Check nginx configuration

### Support Resources

- **Google Cloud**: [Support Console](https://cloud.google.com/support)
- **Vercel**: [Support](https://vercel.com/support)
- **Community**: [GitHub Discussions](https://github.com/neuronadev01-cell/Neurona-dev/discussions)

---

## 🎉 Deployment Complete!

Your Neurona Mental Health Platform is now running with:

- ✅ **Frontend**: Blazing fast on Vercel CDN
- ✅ **Backend**: Scalable on Google Cloud VM
- ✅ **Database**: Managed PostgreSQL with backups
- ✅ **Cache**: Redis for optimal performance
- ✅ **SSL**: Automatic certificates for security
- ✅ **CI/CD**: Automated deployments
- ✅ **Monitoring**: Health checks and logging

**Live URLs**:
- Frontend: https://neurona.health
- Backend API: https://api.neurona.health

Ready to transform mental healthcare! 🧠💙