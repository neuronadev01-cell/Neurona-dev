# Neurona Mental Health Platform 🧠

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CodeQL](https://github.com/neuronadev01-cell/Neurona-dev/workflows/CodeQL/badge.svg)](https://github.com/neuronadev01-cell/Neurona-dev/actions?query=workflow%3ACodeQL)
[![Docker Build](https://github.com/neuronadev01-cell/Neurona-dev/workflows/Docker/badge.svg)](https://github.com/neuronadev01-cell/Neurona-dev/actions?query=workflow%3ADocker)

A comprehensive, HIPAA-compliant mental health platform designed to connect patients with healthcare providers through secure, integrated digital tools.

## 🌟 Features

### 👥 User Management & Authentication
- **Multi-role Authentication**: Patients, Doctors, Admins with role-based access control
- **Secure Login**: JWT-based authentication with session management
- **Profile Management**: Comprehensive user profiles with medical history
- **HIPAA Compliance**: End-to-end encryption and audit logging

### 🏥 Doctor Dashboard
- **Patient Management**: View and manage patient lists and medical records
- **Appointment Scheduling**: Integrated calendar with availability management
- **Medical Records**: Secure access to patient histories and treatment plans
- **Communication Tools**: Secure messaging and notes system

### 🛡️ Admin Dashboard System
- **Platform Management**: System-wide configuration and monitoring
- **User Administration**: Manage healthcare providers and patient accounts
- **Analytics & Reporting**: Comprehensive insights into platform usage
- **Compliance Monitoring**: HIPAA audit trails and security oversight

### 🚨 Crisis Protocol & Detection
- **Real-time Monitoring**: Advanced algorithms for crisis detection
- **Automated Alerts**: Immediate notification system for emergency situations
- **Escalation Workflows**: Configurable crisis response protocols
- **Professional Networks**: Integration with emergency mental health services

### 📊 Advanced Assessment Engine
- **Adaptive Questioning**: Dynamic assessment forms based on responses
- **Risk Scoring**: Real-time mental health risk assessment
- **Longitudinal Tracking**: Progress monitoring over time
- **Evidence-based Tools**: Validated psychological assessment instruments

### 📧 Email Notification System
- **Transactional Emails**: Appointment reminders, notifications, alerts
- **Template Management**: Customizable email templates
- **Delivery Tracking**: Email analytics and delivery monitoring
- **Resend Integration**: Reliable email delivery service

### 🎥 Video Consultation System
- **Secure Video Calls**: HIPAA-compliant telehealth sessions
- **Recording Capabilities**: Session recording with consent management
- **Screen Sharing**: Enhanced consultation tools
- **Audit Logging**: Comprehensive session tracking and compliance

### 📈 Analytics & Reporting Dashboard
- **Patient Outcomes**: Track treatment effectiveness and progress
- **Provider Performance**: Analytics on consultation quality and outcomes
- **Platform Usage**: System utilization and engagement metrics
- **Clinical Insights**: Data-driven mental health trends and patterns

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Context API & Custom Hooks
- **Authentication**: NextAuth.js
- **UI Components**: Custom component library
- **Form Management**: React Hook Form with Zod validation

#### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **Caching**: Redis 7
- **Authentication**: JWT with refresh tokens
- **File Storage**: Google Cloud Storage
- **Email Service**: Resend API

#### Infrastructure
- **Frontend Hosting**: Vercel (CDN + Edge Functions)
- **Backend Hosting**: Google Cloud VM (Ubuntu + Node.js)
- **Database**: Google Cloud SQL PostgreSQL
- **Caching**: Google Cloud Memorystore Redis
- **Storage**: Google Cloud Storage
- **Monitoring**: Google Cloud Monitoring & Logging + Vercel Analytics
- **CI/CD**: GitHub Actions + Vercel Integration
- **IaC**: Terraform for Google Cloud resources

#### Security & Compliance
- **Encryption**: TLS 1.3, AES-256 for data at rest
- **Secrets**: Google Secret Manager
- **Network**: Private VPC with firewall rules
- **Audit**: Comprehensive logging and monitoring
- **Compliance**: HIPAA-ready architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git
- Google Cloud CLI (for production deployment)
- Terraform (for infrastructure deployment)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/neuronadev01-cell/Neurona-dev.git
cd Neurona-dev
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

3. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Update database credentials, API keys, etc.
```

4. **Start with Docker Compose (Recommended)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# pgAdmin: http://localhost:5050 (admin tools)
# Redis Commander: http://localhost:8081 (admin tools)
```

5. **Manual Setup (Alternative)**
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
cd backend
npm run migrate

# Start backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

### Production Deployment

#### Hybrid Architecture: Vercel + Google Cloud

**Frontend (Vercel)**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Configure domains:
# - neurona.health (main)
# - www.neurona.health (redirect)
```

**Backend (Google Cloud VM)**:
```bash
# Navigate to terraform directory
cd terraform

# Deploy infrastructure
terraform init
terraform apply -var-file="terraform.tfvars"

# Deploy backend code to VM
ssh into VM and run:
sudo /opt/neurona/deploy.sh
```

**See detailed guide**: [DEPLOYMENT_HYBRID.md](DEPLOYMENT_HYBRID.md)

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
POST /api/auth/refresh        # Refresh JWT token
POST /api/auth/register       # User registration
POST /api/auth/forgot-password # Password reset
```

### Patient Endpoints
```
GET    /api/patients          # List patients (doctors only)
GET    /api/patients/:id      # Get patient details
PUT    /api/patients/:id      # Update patient profile
POST   /api/patients/assessments # Submit assessment
GET    /api/patients/assessments/:id # Get assessment results
```

### Doctor Endpoints
```
GET    /api/doctors           # List doctors
GET    /api/doctors/:id       # Get doctor profile
PUT    /api/doctors/:id       # Update doctor profile
GET    /api/doctors/:id/appointments # Get appointments
POST   /api/doctors/availability # Set availability
```

### Video Consultation Endpoints
```
POST   /api/consultations     # Create consultation session
GET    /api/consultations/:id # Get session details
POST   /api/consultations/:id/join # Join session
POST   /api/consultations/:id/end # End session
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for a complete list of configuration options:

- **Database Configuration**: PostgreSQL connection settings
- **Redis Configuration**: Cache and session store settings
- **Authentication**: JWT secrets and session configuration
- **Email Service**: Resend API configuration
- **Video Service**: WebRTC and recording settings
- **File Storage**: Google Cloud Storage settings
- **Monitoring**: Logging and analytics configuration

### Feature Flags

The platform supports feature flags for gradual rollouts:

```typescript
{
  ENABLE_VIDEO_CALLS: true,
  ENABLE_CRISIS_DETECTION: true,
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_RECORDING: false
}
```

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
npm run coverage:open
```

## 📊 Monitoring & Logging

### Health Checks
- **Application**: `GET /api/health`
- **Database**: `GET /api/health/db`
- **Redis**: `GET /api/health/redis`
- **Dependencies**: `GET /api/health/deps`

### Monitoring Dashboards
- **Application Metrics**: Google Cloud Monitoring
- **Error Tracking**: Structured logging with correlation IDs
- **Performance**: APM integration with request tracing
- **Security**: Audit logs and security event monitoring

## 🔒 Security

### Data Protection
- **Encryption at Rest**: All data encrypted using AES-256
- **Encryption in Transit**: TLS 1.3 for all communications
- **Key Management**: Google Cloud KMS for key rotation
- **Data Minimization**: Collect only necessary patient information

### Access Control
- **Role-Based Access**: Patients, Doctors, Admins with specific permissions
- **Multi-Factor Authentication**: Optional 2FA for enhanced security
- **Session Management**: Secure session handling with automatic expiration
- **API Rate Limiting**: Protection against abuse and DoS attacks

### Compliance
- **HIPAA Compliance**: Architecture designed for healthcare data protection
- **Audit Trails**: Comprehensive logging of all data access and modifications
- **Data Retention**: Configurable retention policies
- **Privacy Controls**: Patient consent management and data portability

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured for React and Node.js best practices
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality assurance

### Pull Request Requirements
- All tests must pass
- Code coverage must not decrease
- Documentation must be updated
- Security review for sensitive changes
- HIPAA compliance assessment for data handling changes

## 📋 Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ User authentication and management
- ✅ Basic consultation features
- ✅ Crisis detection system
- ✅ Google Cloud deployment

### Phase 2 (Q2 2024)
- [ ] Mobile app development (React Native)
- [ ] Advanced analytics and ML insights
- [ ] Integration with EHR systems
- [ ] Telehealth platform expansion
- [ ] Multi-language support

### Phase 3 (Q3 2024)
- [ ] AI-powered treatment recommendations
- [ ] Wearable device integration
- [ ] Advanced reporting and outcomes tracking
- [ ] Expanded crisis intervention tools
- [ ] Provider marketplace

### Phase 4 (Q4 2024)
- [ ] Multi-tenant architecture
- [ ] White-label solutions
- [ ] Advanced compliance frameworks
- [ ] Global deployment infrastructure
- [ ] Enterprise features and SSO

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Docs**: Available at `/api/docs` when running locally
- **Architecture Guide**: See `docs/architecture.md`
- **Deployment Guide**: See `docs/deployment.md`
- **Security Guide**: See `docs/security.md`

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/neuronadev01-cell/Neurona-dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/neuronadev01-cell/Neurona-dev/discussions)
- **Email**: support@neurona.health

### Professional Support
For enterprise deployments, HIPAA compliance consulting, or custom development:
- **Enterprise Support**: enterprise@neurona.health
- **Compliance Consulting**: compliance@neurona.health
- **Custom Development**: dev@neurona.health

---

## 🏥 Healthcare Notice

**Important**: This platform is designed to assist mental healthcare delivery but is not a replacement for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions. In case of emergency, contact local emergency services immediately.

**Crisis Support**:
- **US**: National Suicide Prevention Lifeline: 988
- **International**: [List of international crisis lines](https://www.opencounseling.com/suicide-hotlines)

---

Made with ❤️ for better mental healthcare accessibility

**Neurona Development Team**  
Building the future of digital mental health
