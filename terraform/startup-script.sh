#!/bin/bash

# Neurona Backend VM Startup Script
# This script configures the Ubuntu VM for running the Neurona backend

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Neurona Backend VM Setup...${NC}"

# Update system packages
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    nginx \
    ufw \
    htop \
    vim \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Node.js 18
echo -e "${YELLOW}Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -g pm2

# Install Docker (for development/testing)
echo -e "${YELLOW}Installing Docker...${NC}"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Google Cloud SQL Proxy
echo -e "${YELLOW}Installing Cloud SQL Proxy...${NC}"
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud_sql_proxy
mv cloud_sql_proxy /usr/local/bin/

# Create application directory
echo -e "${YELLOW}Creating application directory...${NC}"
mkdir -p /opt/neurona
chown -R ubuntu:ubuntu /opt/neurona

# Create environment file
echo -e "${YELLOW}Creating environment configuration...${NC}"
cat > /opt/neurona/.env << EOF
# Neurona Backend Environment Configuration
NODE_ENV=${environment}
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://${db_user}:${db_password}@${db_host}:5432/${db_name}?sslmode=require
DB_HOST=${db_host}
DB_PORT=5432
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}

# Redis Configuration
REDIS_HOST=${redis_host}
REDIS_PORT=${redis_port}
REDIS_URL=redis://${redis_host}:${redis_port}

# Application Configuration
JWT_SECRET=\${JWT_SECRET}
JWT_EXPIRES_IN=24h

# Email Configuration (Resend)
RESEND_API_KEY=\${RESEND_API_KEY}
FROM_EMAIL=noreply@neurona.health

# CORS Configuration
CORS_ORIGIN=https://neurona.health

# Logging Configuration
LOG_LEVEL=info

# Health Check
HEALTH_CHECK_ENDPOINT=/api/health

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/opt/neurona/uploads

# Crisis Management
CRISIS_ALERT_EMAIL=crisis@neurona.health

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

EOF

chown ubuntu:ubuntu /opt/neurona/.env
chmod 600 /opt/neurona/.env

# Configure Nginx as reverse proxy
echo -e "${YELLOW}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/neurona << EOF
server {
    listen 80;
    server_name api.neurona.health;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /api/health {
        access_log off;
        proxy_pass http://localhost:3000/api/health;
    }

    # Static files (if needed)
    location /static/ {
        alias /opt/neurona/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Remove default site and enable neurona site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/neurona /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000/tcp

# Create systemd service for the application
echo -e "${YELLOW}Creating systemd service...${NC}"
cat > /etc/systemd/system/neurona-backend.service << EOF
[Unit]
Description=Neurona Mental Health Platform Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/neurona
Environment=NODE_ENV=${environment}
EnvironmentFile=/opt/neurona/.env
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=neurona-backend

[Install]
WantedBy=multi-user.target
EOF

# Create PM2 ecosystem file
echo -e "${YELLOW}Creating PM2 configuration...${NC}"
cat > /opt/neurona/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'neurona-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: '${environment}',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/neurona/combined.log',
    out_file: '/var/log/neurona/out.log',
    error_file: '/var/log/neurona/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
}
EOF

chown ubuntu:ubuntu /opt/neurona/ecosystem.config.js

# Create log directory
mkdir -p /var/log/neurona
chown ubuntu:ubuntu /var/log/neurona

# Setup log rotation
cat > /etc/logrotate.d/neurona << EOF
/var/log/neurona/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 ubuntu ubuntu
    postrotate
        sudo -u ubuntu pm2 reloadLogs
    endscript
}
EOF

# Create deployment script
echo -e "${YELLOW}Creating deployment script...${NC}"
cat > /opt/neurona/deploy.sh << 'EOF'
#!/bin/bash

# Neurona Backend Deployment Script

set -euo pipefail

REPO_URL="https://github.com/neuronadev01-cell/Neurona-dev.git"
APP_DIR="/opt/neurona"
BACKUP_DIR="/opt/neurona/backups/$(date +%Y%m%d_%H%M%S)"

echo "🚀 Starting Neurona Backend Deployment..."

# Create backup
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
if [ -d "$APP_DIR/backend" ]; then
    cp -r "$APP_DIR/backend" "$BACKUP_DIR/"
fi

# Clone or update repository
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR/temp"
    mv "$APP_DIR/temp/backend/"* "$APP_DIR/" 2>/dev/null || true
    mv "$APP_DIR/temp/.git" "$APP_DIR/"
    rm -rf "$APP_DIR/temp"
else
    echo "🔄 Updating repository..."
    cd "$APP_DIR"
    git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd "$APP_DIR"
npm install --production

# Run database migrations
echo "🗄️ Running database migrations..."
npm run migrate 2>/dev/null || echo "No migrations to run"

# Restart application
echo "🔄 Restarting application..."
pm2 delete neurona-backend 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo "✅ Deployment completed successfully!"
EOF

chmod +x /opt/neurona/deploy.sh
chown ubuntu:ubuntu /opt/neurona/deploy.sh

# Create simple health check script
echo -e "${YELLOW}Creating health check script...${NC}"
cat > /opt/neurona/health-check.sh << 'EOF'
#!/bin/bash

# Simple health check for Neurona backend
HEALTH_URL="http://localhost:3000/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$response" = "200" ]; then
    echo "✅ Health check passed (HTTP $response)"
    exit 0
else
    echo "❌ Health check failed (HTTP $response)"
    exit 1
fi
EOF

chmod +x /opt/neurona/health-check.sh
chown ubuntu:ubuntu /opt/neurona/health-check.sh

# Setup cron for health checks
echo -e "${YELLOW}Setting up health monitoring...${NC}"
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/neurona/health-check.sh >> /var/log/neurona/health.log 2>&1") | crontab -

# Enable and start services
echo -e "${YELLOW}Starting services...${NC}"
systemctl daemon-reload
systemctl enable nginx
systemctl start nginx
systemctl restart nginx

# Set up PM2 startup
sudo -u ubuntu pm2 startup systemd -u ubuntu --hp /home/ubuntu
systemctl enable pm2-ubuntu

# Install SSL certificate (Let's Encrypt) preparation
echo -e "${YELLOW}Preparing for SSL certificate...${NC}"
snap install core; snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# Create SSL setup script for later use
cat > /opt/neurona/setup-ssl.sh << 'EOF'
#!/bin/bash

# SSL Certificate Setup for Neurona Backend
# Run this after DNS is configured

echo "🔐 Setting up SSL certificate..."

# Stop nginx temporarily
systemctl stop nginx

# Obtain certificate
certbot certonly --standalone -d api.neurona.health --non-interactive --agree-tos -m admin@neurona.health

# Update nginx configuration for SSL
cat > /etc/nginx/sites-available/neurona << 'NGINXEOF'
server {
    listen 80;
    server_name api.neurona.health;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.neurona.health;

    ssl_certificate /etc/letsencrypt/live/api.neurona.health/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.neurona.health/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /api/health {
        access_log off;
        proxy_pass http://localhost:3000/api/health;
    }
}
NGINXEOF

# Restart nginx
systemctl start nginx
systemctl reload nginx

# Setup auto-renewal
certbot renew --dry-run

echo "✅ SSL certificate configured successfully!"
EOF

chmod +x /opt/neurona/setup-ssl.sh

# Final setup
echo -e "${YELLOW}Finalizing setup...${NC}"

# Create uploads directory
mkdir -p /opt/neurona/uploads
chown -R ubuntu:ubuntu /opt/neurona/uploads

# Set proper permissions
chown -R ubuntu:ubuntu /opt/neurona
chmod -R 755 /opt/neurona

echo -e "${GREEN}✅ Neurona Backend VM Setup Complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Configure DNS: Point api.neurona.health to this VM's IP"
echo -e "2. Deploy backend code: Run /opt/neurona/deploy.sh"
echo -e "3. Setup SSL: Run /opt/neurona/setup-ssl.sh"
echo -e "4. Configure environment variables in /opt/neurona/.env"
echo ""
echo -e "${YELLOW}VM is ready for Neurona backend deployment! 🚀${NC}"
EOF