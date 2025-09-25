# Terraform configuration for Neurona Mental Health Platform on Google Cloud
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "neurona-terraform-state"
    prefix = "terraform/state"
  }
}

# Configure Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Data sources
data "google_project" "current" {}

data "google_compute_zones" "available" {
  region = var.region
}

# Variables
variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Google Cloud zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "neurona"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "neurona.health"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "neurona_user"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Labels for all resources
locals {
  labels = {
    project     = var.app_name
    environment = var.environment
    terraform   = "true"
  }
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "compute.googleapis.com",
    "cloudrun.googleapis.com",
    "cloudsql.googleapis.com",
    "redis.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "certificatemanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "vpcaccess.googleapis.com"
  ])
  
  project = var.project_id
  service = each.value
  
  disable_dependent_services = true
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = "${var.app_name}-vpc-${var.environment}"
  auto_create_subnetworks = false
  
  depends_on = [google_project_service.apis]
}

# Subnet for Cloud Run
resource "google_compute_subnetwork" "main" {
  name          = "${var.app_name}-subnet-${var.environment}"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.main.id
  
  private_ip_google_access = true
}

# Cloud NAT for outbound internet access
resource "google_compute_router" "main" {
  name    = "${var.app_name}-router-${var.environment}"
  region  = var.region
  network = google_compute_network.main.id
}

resource "google_compute_router_nat" "main" {
  name                               = "${var.app_name}-nat-${var.environment}"
  router                             = google_compute_router.main.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# VPC Connector for Cloud Run
resource "google_vpc_access_connector" "main" {
  name          = "${var.app_name}-connector-${var.environment}"
  region        = var.region
  ip_cidr_range = "10.1.0.0/28"
  network       = google_compute_network.main.name
  
  depends_on = [google_project_service.apis]
}

# Cloud SQL PostgreSQL Database
resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier                        = var.environment == "production" ? "db-standard-2" : "db-f1-micro"
    availability_type           = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_type                   = "PD_SSD"
    disk_size                   = var.environment == "production" ? 100 : 20
    disk_autoresize             = true
    disk_autoresize_limit       = var.environment == "production" ? 1000 : 100
    
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "production"
      backup_retention_settings {
        retained_backups = var.environment == "production" ? 7 : 3
      }
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
      require_ssl     = true
    }
    
    database_flags {
      name  = "log_statement"
      value = "all"
    }
    
    user_labels = local.labels
  }
  
  deletion_protection = var.environment == "production"
  
  depends_on = [
    google_project_service.apis,
    google_service_networking_connection.private_vpc_connection
  ]
}

# Private VPC connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.app_name}-private-ip-${var.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Database and User
resource "google_sql_database" "main" {
  name     = "neurona"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "main" {
  name     = var.db_username
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# Redis Instance (Memorystore)
resource "google_redis_instance" "main" {
  name           = "${var.app_name}-redis-${var.environment}"
  memory_size_gb = var.environment == "production" ? 2 : 1
  tier           = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  region         = var.region
  
  authorized_network = google_compute_network.main.id
  transit_encryption_mode = "SERVER_AUTHENTICATION"
  auth_enabled = true
  
  redis_version = "REDIS_7_0"
  display_name  = "${var.app_name} Redis ${var.environment}"
  
  labels = local.labels
  
  depends_on = [google_project_service.apis]
}

# Cloud Storage Bucket
resource "google_storage_bucket" "main" {
  name     = "${var.app_name}-storage-${var.environment}-${random_id.bucket_suffix.hex}"
  location = var.region
  
  uniform_bucket_level_access = true
  
  encryption {
    default_kms_key_name = google_kms_crypto_key.storage.id
  }
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = var.environment == "production" ? 90 : 30
    }
    action {
      type = "Delete"
    }
  }
  
  labels = local.labels
}

resource "random_id" "bucket_suffix" {
  byte_length = 8
}

# KMS for encryption
resource "google_kms_key_ring" "main" {
  name     = "${var.app_name}-keyring-${var.environment}"
  location = var.region
}

resource "google_kms_crypto_key" "storage" {
  name     = "${var.app_name}-storage-key"
  key_ring = google_kms_key_ring.main.id
  
  lifecycle {
    prevent_destroy = true
  }
}

# Secret Manager secrets
resource "google_secret_manager_secret" "database_url" {
  secret_id = "${var.app_name}-database-url-${var.environment}"
  
  labels = local.labels
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.main.name}:${var.db_password}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.main.name}?sslmode=require"
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "${var.app_name}-redis-url-${var.environment}"
  
  labels = local.labels
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret = google_secret_manager_secret.redis_url.id
  secret_data = "redis://:${google_redis_instance.main.auth_string}@${google_redis_instance.main.host}:${google_redis_instance.main.port}"
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "main" {
  name     = "${var.app_name}-${var.environment}"
  location = var.region
  
  template {
    scaling {
      min_instance_count = var.environment == "production" ? 1 : 0
      max_instance_count = var.environment == "production" ? 10 : 3
    }
    
    vpc_access {
      connector = google_vpc_access_connector.main.id
      egress = "ALL_TRAFFIC"
    }
    
    containers {
      image = "gcr.io/${var.project_id}/${var.app_name}:latest"
      
      ports {
        container_port = 3000
      }
      
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      
      env {
        name  = "PORT"
        value = "3000"
      }
      
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "REDIS_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.redis_url.secret_id
            version = "latest"
          }
        }
      }
      
      resources {
        limits = {
          cpu    = var.environment == "production" ? "2" : "1"
          memory = var.environment == "production" ? "4Gi" : "2Gi"
        }
      }
      
      startup_probe {
        http_get {
          path = "/api/health"
          port = 3000
        }
        initial_delay_seconds = 30
        period_seconds = 10
        timeout_seconds = 5
        failure_threshold = 3
      }
      
      liveness_probe {
        http_get {
          path = "/api/health"
          port = 3000
        }
        initial_delay_seconds = 60
        period_seconds = 30
        timeout_seconds = 5
        failure_threshold = 3
      }
    }
    
    service_account = google_service_account.cloudrun.email
  }
  
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
  
  depends_on = [google_project_service.apis]
  
  labels = local.labels
}

# Cloud Run IAM
resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_v2_service.main.location
  project  = google_cloud_run_v2_service.main.project
  service  = google_cloud_run_v2_service.main.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Service Account for Cloud Run
resource "google_service_account" "cloudrun" {
  account_id   = "${var.app_name}-cloudrun-${var.environment}"
  display_name = "${var.app_name} Cloud Run Service Account"
}

resource "google_project_iam_member" "cloudrun_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

resource "google_project_iam_member" "cloudrun_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

resource "google_project_iam_member" "cloudrun_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Load Balancer and SSL Certificate
resource "google_compute_managed_ssl_certificate" "main" {
  name = "${var.app_name}-ssl-${var.environment}"
  
  managed {
    domains = [var.domain_name, "*.${var.domain_name}"]
  }
}

resource "google_compute_global_address" "main" {
  name = "${var.app_name}-lb-ip-${var.environment}"
}

resource "google_compute_url_map" "main" {
  name            = "${var.app_name}-urlmap-${var.environment}"
  default_service = google_compute_backend_service.main.id
}

resource "google_compute_backend_service" "main" {
  name        = "${var.app_name}-backend-${var.environment}"
  protocol    = "HTTP"
  port_name   = "http"
  timeout_sec = 30
  
  backend {
    group = google_compute_region_network_endpoint_group.main.id
  }
  
  health_checks = [google_compute_health_check.main.id]
}

resource "google_compute_region_network_endpoint_group" "main" {
  name                  = "${var.app_name}-neg-${var.environment}"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  
  cloud_run {
    service = google_cloud_run_v2_service.main.name
  }
}

resource "google_compute_health_check" "main" {
  name               = "${var.app_name}-healthcheck-${var.environment}"
  timeout_sec        = 5
  check_interval_sec = 30
  
  http_health_check {
    port         = 3000
    request_path = "/api/health"
  }
}

resource "google_compute_target_https_proxy" "main" {
  name             = "${var.app_name}-https-proxy-${var.environment}"
  url_map          = google_compute_url_map.main.id
  ssl_certificates = [google_compute_managed_ssl_certificate.main.id]
}

resource "google_compute_target_http_proxy" "main" {
  name    = "${var.app_name}-http-proxy-${var.environment}"
  url_map = google_compute_url_map.redirect.id
}

resource "google_compute_url_map" "redirect" {
  name = "${var.app_name}-redirect-${var.environment}"
  
  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

resource "google_compute_global_forwarding_rule" "https" {
  name       = "${var.app_name}-https-${var.environment}"
  target     = google_compute_target_https_proxy.main.id
  port_range = "443"
  ip_address = google_compute_global_address.main.address
}

resource "google_compute_global_forwarding_rule" "http" {
  name       = "${var.app_name}-http-${var.environment}"
  target     = google_compute_target_http_proxy.main.id
  port_range = "80"
  ip_address = google_compute_global_address.main.address
}

# Cloud Build trigger for CI/CD
resource "google_cloudbuild_trigger" "main" {
  name        = "${var.app_name}-build-${var.environment}"
  description = "Build and deploy ${var.app_name} on push to ${var.environment == "production" ? "main" : "staging"}"
  
  github {
    owner = "neuronadev01-cell"
    name  = "Neurona-dev"
    push {
      branch = var.environment == "production" ? "main" : "staging"
    }
  }
  
  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "build",
        "-t",
        "gcr.io/${var.project_id}/${var.app_name}:$COMMIT_SHA",
        "-t",
        "gcr.io/${var.project_id}/${var.app_name}:latest",
        "."
      ]
    }
    
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "push",
        "gcr.io/${var.project_id}/${var.app_name}:$COMMIT_SHA"
      ]
    }
    
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "push",
        "gcr.io/${var.project_id}/${var.app_name}:latest"
      ]
    }
    
    step {
      name = "gcr.io/cloud-builders/gcloud"
      args = [
        "run",
        "deploy",
        google_cloud_run_v2_service.main.name,
        "--image",
        "gcr.io/${var.project_id}/${var.app_name}:$COMMIT_SHA",
        "--region",
        var.region,
        "--quiet"
      ]
    }
  }
}

# Monitoring and Logging
resource "google_logging_project_sink" "main" {
  name        = "${var.app_name}-logs-${var.environment}"
  destination = "storage.googleapis.com/${google_storage_bucket.logs.name}"
  filter      = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${google_cloud_run_v2_service.main.name}\""
  
  unique_writer_identity = true
}

resource "google_storage_bucket" "logs" {
  name     = "${var.app_name}-logs-${var.environment}-${random_id.logs_suffix.hex}"
  location = var.region
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      age = var.environment == "production" ? 90 : 30
    }
    action {
      type = "Delete"
    }
  }
  
  labels = local.labels
}

resource "random_id" "logs_suffix" {
  byte_length = 8
}

resource "google_storage_bucket_iam_member" "logs_writer" {
  bucket = google_storage_bucket.logs.name
  role   = "roles/storage.objectCreator"
  member = google_logging_project_sink.main.writer_identity
}

# Monitoring Dashboard
resource "google_monitoring_dashboard" "main" {
  dashboard_json = jsonencode({
    displayName = "${var.app_name} Dashboard - ${var.environment}"
    mosaicLayout = {
      tiles = [
        {
          width = 6
          height = 4
          widget = {
            title = "Cloud Run Request Count"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${google_cloud_run_v2_service.main.name}\""
                    aggregation = {
                      alignmentPeriod = "60s"
                      perSeriesAligner = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                    }
                  }
                }
                plotType = "LINE"
              }]
            }
          }
        }
      ]
    }
  })
}

# Outputs
output "service_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.main.uri
}

output "load_balancer_ip" {
  description = "IP address of the load balancer"
  value       = google_compute_global_address.main.address
}

output "database_connection" {
  description = "Database connection name"
  value       = google_sql_database_instance.main.connection_name
  sensitive   = true
}

output "redis_host" {
  description = "Redis host"
  value       = google_redis_instance.main.host
  sensitive   = true
}

output "storage_bucket" {
  description = "Storage bucket name"
  value       = google_storage_bucket.main.name
}