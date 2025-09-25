#!/bin/bash

# Neurona Mental Health Platform - Google Cloud Deployment Script
# This script sets up and deploys the Neurona platform to Google Cloud

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PROJECT_ID=""
REGION="us-central1"
ZONE="us-central1-a"
ENVIRONMENT="production"
DOMAIN=""
DB_PASSWORD=""
JWT_SECRET=""
RESEND_API_KEY=""

# Print usage information
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --project-id      Google Cloud Project ID (required)"
    echo "  -r, --region          Google Cloud region (default: us-central1)"
    echo "  -z, --zone            Google Cloud zone (default: us-central1-a)"
    echo "  -e, --environment     Environment (production|staging) (default: production)"
    echo "  -d, --domain          Domain name for the application"
    echo "  --db-password         Database password (required)"
    echo "  --jwt-secret          JWT secret key (required)"
    echo "  --resend-api-key      Resend API key for emails (required)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -p my-project-id -d neurona.health --db-password mypassword --jwt-secret myjwtsecret --resend-api-key re_mykey"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -z|--zone)
            ZONE="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        --db-password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        --jwt-secret)
            JWT_SECRET="$2"
            shift 2
            ;;
        --resend-api-key)
            RESEND_API_KEY="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$PROJECT_ID" ]]; then
    echo -e "${RED}Error: Project ID is required${NC}"
    usage
    exit 1
fi

if [[ -z "$DB_PASSWORD" ]]; then
    echo -e "${RED}Error: Database password is required${NC}"
    usage
    exit 1
fi

if [[ -z "$JWT_SECRET" ]]; then
    echo -e "${RED}Error: JWT secret is required${NC}"
    usage
    exit 1
fi

if [[ -z "$RESEND_API_KEY" ]]; then
    echo -e "${RED}Error: Resend API key is required${NC}"
    usage
    exit 1
fi

# Print configuration
echo -e "${BLUE}Neurona Deployment Configuration:${NC}"
echo -e "Project ID: ${GREEN}$PROJECT_ID${NC}"
echo -e "Region: ${GREEN}$REGION${NC}"
echo -e "Zone: ${GREEN}$ZONE${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Domain: ${GREEN}${DOMAIN:-"Not specified"}${NC}"
echo ""

# Confirm deployment
read -p "Do you want to continue with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Setting up Google Cloud project...${NC}"

# Set the project
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo -e "${YELLOW}Enabling required Google Cloud APIs...${NC}"
gcloud services enable \
    compute.googleapis.com \
    cloudrun.googleapis.com \
    cloudsql.googleapis.com \
    redis.googleapis.com \
    secretmanager.googleapis.com \
    storage.googleapis.com \
    logging.googleapis.com \
    monitoring.googleapis.com \
    certificatemanager.googleapis.com \
    servicenetworking.googleapis.com \
    vpcaccess.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com

echo -e "${YELLOW}Step 2: Creating secrets in Secret Manager...${NC}"

# Create secrets
echo "$DB_PASSWORD" | gcloud secrets create neurona-database-password-$ENVIRONMENT --data-file=- || echo "Secret already exists"
echo "$JWT_SECRET" | gcloud secrets create neurona-jwt-secret-$ENVIRONMENT --data-file=- || echo "Secret already exists"
echo "$RESEND_API_KEY" | gcloud secrets create neurona-resend-api-key-$ENVIRONMENT --data-file=- || echo "Secret already exists"

echo -e "${YELLOW}Step 3: Creating Terraform state bucket...${NC}"

# Create bucket for Terraform state
BUCKET_NAME="neurona-terraform-state-$PROJECT_ID"
gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://$BUCKET_NAME" || echo "Bucket already exists"
gsutil versioning set on "gs://$BUCKET_NAME"

echo -e "${YELLOW}Step 4: Running Terraform deployment...${NC}"

# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init -reconfigure \
    -backend-config="bucket=$BUCKET_NAME" \
    -backend-config="prefix=terraform/state/$ENVIRONMENT"

# Plan deployment
terraform plan \
    -var="project_id=$PROJECT_ID" \
    -var="region=$REGION" \
    -var="zone=$ZONE" \
    -var="environment=$ENVIRONMENT" \
    -var="db_password=$DB_PASSWORD" \
    ${DOMAIN:+-var="domain_name=$DOMAIN"} \
    -out=tfplan

# Apply deployment
terraform apply tfplan

# Get outputs
SERVICE_URL=$(terraform output -raw service_url)
LOAD_BALANCER_IP=$(terraform output -raw load_balancer_ip)

cd ..

echo -e "${YELLOW}Step 5: Building and pushing Docker image...${NC}"

# Build Docker image
docker build -t "gcr.io/$PROJECT_ID/neurona:latest" .

# Push to Container Registry
docker push "gcr.io/$PROJECT_ID/neurona:latest"

echo -e "${YELLOW}Step 6: Setting up Cloud Build trigger...${NC}"

# Create Cloud Build trigger (if it doesn't exist)
gcloud builds triggers create github \
    --repo-name=Neurona-dev \
    --repo-owner=neuronadev01-cell \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml \
    --name="neurona-main-$ENVIRONMENT" || echo "Trigger already exists"

echo -e "${YELLOW}Step 7: Running initial health checks...${NC}"

# Wait for service to be ready
echo "Waiting for service to be ready..."
sleep 30

# Health check
if curl -f "$SERVICE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo -e "Service URL: ${GREEN}$SERVICE_URL${NC}"
echo -e "Load Balancer IP: ${GREEN}$LOAD_BALANCER_IP${NC}"
echo ""

if [[ -n "$DOMAIN" ]]; then
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Point your domain $DOMAIN to IP: $LOAD_BALANCER_IP"
    echo "2. Wait for SSL certificate to be provisioned (may take up to 30 minutes)"
    echo "3. Access your application at https://$DOMAIN"
else
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Access your application at: $SERVICE_URL"
    echo "2. Consider setting up a custom domain by running the script again with -d flag"
fi

echo ""
echo -e "${BLUE}Additional resources:${NC}"
echo "- Google Cloud Console: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "- Cloud SQL: https://console.cloud.google.com/sql?project=$PROJECT_ID"
echo "- Secret Manager: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
echo "- Monitoring: https://console.cloud.google.com/monitoring?project=$PROJECT_ID"