# Neurona Mental Health Platform - Deployment Guide

This document provides comprehensive instructions for deploying the Neurona Mental Health Platform to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [AWS Infrastructure](#aws-infrastructure)
- [CI/CD Pipeline](#ci/cd-pipeline)
- [Monitoring & Maintenance](#monitoring-&-maintenance)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment
- Node.js 18+ 
- Docker & Docker Compose
- Terraform >= 1.0
- AWS CLI configured
- GitHub CLI (optional)

### Production Environment
- AWS Account with appropriate permissions
- Domain name registered
- SSL certificates (or use AWS Certificate Manager)
- SendGrid/SES for email delivery
- Video service provider API keys (Twilio/Agora)

## Environment Setup

### 1. Environment Variables

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Update the following critical variables:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://neurona.health

# Security
NEXTAUTH_SECRET=your-super-secure-secret-key-minimum-32-characters
JWT_SECRET=another-secure-jwt-secret-key

# Database
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_PASSWORD=secure-database-password

# External Services
EMAIL_API_KEY=sendgrid-or-ses-api-key
VIDEO_API_KEY=twilio-or-agora-api-key
VIDEO_API_SECRET=video-service-secret

# AWS Configuration
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=neurona-storage-prod
```

### 2. Database Setup

#### Local Development with Docker

```bash
# Start local infrastructure
docker-compose up postgres redis -d

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

#### Production Database

The Terraform configuration provisions a managed PostgreSQL instance on AWS RDS. Database credentials are stored securely in AWS Secrets Manager.

## Docker Deployment

### 1. Local Testing

Build and test the Docker container locally:

```bash
# Build the Docker image
docker build -t neurona:latest .

# Test the container
docker run -p 3000:3000 --env-file .env.local neurona:latest

# Run full stack locally
docker-compose up --build
```

### 2. Production Container

The production container is automatically built and pushed to GitHub Container Registry via GitHub Actions. Manual build:

```bash
# Build for production
docker build --platform linux/amd64,linux/arm64 -t neurona:prod .

# Tag for registry
docker tag neurona:prod ghcr.io/yourorg/neurona:latest

# Push to registry
docker push ghcr.io/yourorg/neurona:latest
```

## AWS Infrastructure

### 1. Terraform Setup

Initialize and configure Terraform backend:

```bash
cd terraform

# Create S3 bucket for Terraform state (one-time setup)
aws s3 mb s3://neurona-terraform-state --region us-west-2
aws s3api put-bucket-versioning \
  --bucket neurona-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Initialize Terraform
terraform init
```

### 2. Infrastructure Deployment

Deploy the infrastructure:

```bash
# Plan the deployment
terraform plan -var="db_password=your-secure-database-password"

# Apply the infrastructure
terraform apply -var="db_password=your-secure-database-password"

# Get outputs
terraform output
```

### 3. Infrastructure Components

The Terraform configuration deploys:

- **VPC**: Private networking with public/private subnets
- **ALB**: Application Load Balancer with SSL termination
- **ECS**: Container orchestration with Fargate
- **RDS**: Managed PostgreSQL database with encryption
- **ElastiCache**: Redis cluster for caching and sessions
- **S3**: Encrypted storage for files and static assets
- **CloudWatch**: Logging and monitoring
- **Secrets Manager**: Secure storage for sensitive data
- **ACM**: SSL/TLS certificates

## CI/CD Pipeline

### 1. GitHub Actions Setup

The repository includes a comprehensive CI/CD pipeline (`.github/workflows/deploy.yml`) that:

- Runs tests and security scanning
- Builds and pushes Docker images
- Deploys to staging and production environments
- Runs database migrations
- Sends deployment notifications

### 2. Required GitHub Secrets

Configure the following secrets in your GitHub repository:

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
PRODUCTION_DATABASE_URL=postgresql://...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### 3. Deployment Workflow

1. **Development**: Push to feature branches triggers tests
2. **Staging**: Push to `staging` branch deploys to staging environment
3. **Production**: Push to `main` branch deploys to production
4. **Database Migrations**: Automatic migration on production deployment

## Monitoring & Maintenance

### 1. Health Checks

The application includes health check endpoints:

- `/api/health` - Basic health check
- `/api/health/detailed` - Detailed system status
- `/api/metrics` - Application metrics

### 2. Logging

Centralized logging with CloudWatch:

```bash
# View application logs
aws logs tail /ecs/neurona-production --follow

# Filter error logs
aws logs filter-log-events \
  --log-group-name /ecs/neurona-production \
  --filter-pattern "ERROR"
```

### 3. Monitoring Setup

Optional monitoring stack with Docker Compose:

```bash
# Start monitoring (Prometheus + Grafana)
docker-compose --profile monitoring up -d

# Access dashboards
open http://localhost:9090  # Prometheus
open http://localhost:3001  # Grafana
```

### 4. Database Maintenance

```bash
# Create database backup
aws rds create-db-snapshot \
  --db-instance-identifier neurona-db-production \
  --db-snapshot-identifier neurona-backup-$(date +%Y%m%d)

# Monitor database performance
aws rds describe-db-instances \
  --db-instance-identifier neurona-db-production
```

## Security Considerations

### 1. HIPAA Compliance

The platform is designed with HIPAA compliance in mind:

- **Encryption**: All data encrypted at rest and in transit
- **Access Control**: Role-based access with audit logging
- **Data Retention**: Configurable retention policies
- **Audit Trails**: Comprehensive audit logging for all actions

### 2. Security Features

- **Authentication**: Multi-factor authentication support
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **SSL/TLS**: End-to-end encryption with strong cipher suites
- **Security Headers**: CSP, HSTS, and other security headers
- **Vulnerability Scanning**: Automated security scanning in CI/CD

### 3. Environment Security

```bash
# Rotate secrets regularly
aws secretsmanager update-secret \
  --secret-id neurona/database-url/production \
  --secret-string "new-database-connection-string"

# Enable CloudTrail for audit logging
aws cloudtrail create-trail \
  --name neurona-audit-trail \
  --s3-bucket-name neurona-audit-logs

# Review security groups
aws ec2 describe-security-groups \
  --group-names neurona-*-production
```

## Troubleshooting

### Common Issues

#### 1. Container Health Check Failures

```bash
# Check container logs
docker logs <container-id>

# Test health endpoint locally
curl -f http://localhost:3000/api/health
```

#### 2. Database Connection Issues

```bash
# Verify database connectivity
aws rds describe-db-instances --db-instance-identifier neurona-db-production

# Test connection from ECS task
aws ecs execute-command \
  --cluster neurona-production \
  --task <task-arn> \
  --container neurona-container \
  --command "/bin/bash" \
  --interactive
```

#### 3. SSL Certificate Issues

```bash
# Check certificate status
aws acm describe-certificate --certificate-arn <cert-arn>

# Verify DNS validation
dig CNAME _validation.neurona.health
```

#### 4. Deployment Failures

```bash
# Check ECS service status
aws ecs describe-services \
  --cluster neurona-production \
  --services neurona-frontend

# View deployment logs
aws logs tail /ecs/neurona-production --follow
```

### Performance Optimization

#### 1. Application Performance

```bash
# Monitor application metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=neurona-frontend

# Scale ECS service
aws ecs update-service \
  --cluster neurona-production \
  --service neurona-frontend \
  --desired-count 4
```

#### 2. Database Performance

```bash
# Monitor database performance
aws rds describe-db-instances \
  --db-instance-identifier neurona-db-production \
  --query 'DBInstances[0].{CPUUtilization:ProcessorFeatures,Storage:AllocatedStorage}'

# Enable Performance Insights
aws rds modify-db-instance \
  --db-instance-identifier neurona-db-production \
  --enable-performance-insights
```

## Disaster Recovery

### 1. Backup Strategy

- **Database**: Automated daily backups with point-in-time recovery
- **Files**: S3 versioning and cross-region replication
- **Infrastructure**: Terraform state backup and version control

### 2. Recovery Procedures

```bash
# Restore database from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier neurona-db-restored \
  --db-snapshot-identifier neurona-backup-20240101

# Restore files from S3 backup
aws s3 sync s3://neurona-storage-backup s3://neurona-storage-production

# Redeploy infrastructure
terraform apply -var="environment=production-recovery"
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review security logs and alerts
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review access permissions and rotate secrets
4. **Annually**: Security audit and penetration testing

### Getting Help

- **Documentation**: Check this guide and inline code comments
- **Logs**: Review CloudWatch logs for detailed error information
- **Monitoring**: Use Grafana dashboards for system insights
- **Support**: Contact the development team for assistance

---

For additional support or questions about deployment, please refer to the project documentation or contact the development team.