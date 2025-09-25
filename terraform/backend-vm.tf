# Terraform configuration for Neurona Backend on Google Cloud VM
# Frontend will be hosted on Vercel, backend on GCP VM

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "neurona-terraform-state"
    prefix = "terraform/backend"
  }
}

# Configure Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
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

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "API domain name"
  type        = string
  default     = "api.neurona.health"
}

# Labels for all resources
locals {
  labels = {
    project     = "neurona"
    environment = var.environment
    terraform   = "true"
    component   = "backend"
  }
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "compute.googleapis.com",
    "cloudsql.googleapis.com",
    "redis.googleapis.com",
    "secretmanager.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "servicenetworking.googleapis.com"
  ])
  
  project = var.project_id
  service = each.value
  
  disable_dependent_services = true
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = "neurona-backend-vpc-${var.environment}"
  auto_create_subnetworks = false
  
  depends_on = [google_project_service.apis]
}

# Subnet
resource "google_compute_subnetwork" "main" {
  name          = "neurona-backend-subnet-${var.environment}"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.main.id
  
  private_ip_google_access = true
}

# Firewall rules
resource "google_compute_firewall" "allow_ssh" {
  name    = "neurona-backend-allow-ssh-${var.environment}"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]  # Restrict this in production
  target_tags   = ["neurona-backend"]
}

resource "google_compute_firewall" "allow_api" {
  name    = "neurona-backend-allow-api-${var.environment}"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["3000", "80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["neurona-backend"]
}

# Static IP for the backend VM
resource "google_compute_address" "backend_ip" {
  name   = "neurona-backend-ip-${var.environment}"
  region = var.region
}

# Backend VM instance
resource "google_compute_instance" "backend" {
  name         = "neurona-backend-${var.environment}"
  machine_type = var.environment == "production" ? "e2-standard-2" : "e2-medium"
  zone         = var.zone

  tags = ["neurona-backend", "http-server", "https-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.environment == "production" ? 50 : 20
      type  = "pd-standard"
    }
  }

  network_interface {
    network    = google_compute_network.main.name
    subnetwork = google_compute_subnetwork.main.name

    access_config {
      nat_ip = google_compute_address.backend_ip.address
    }
  }

  metadata = {
    ssh-keys = "neurona:${file("~/.ssh/id_rsa.pub")}"
  }

  metadata_startup_script = templatefile("${path.module}/startup-script.sh", {
    db_host     = google_sql_database_instance.main.private_ip_address
    db_name     = google_sql_database.main.name
    db_user     = google_sql_user.main.name
    db_password = var.db_password
    redis_host  = google_redis_instance.main.host
    redis_port  = google_redis_instance.main.port
    environment = var.environment
  })

  service_account {
    email  = google_service_account.backend.email
    scopes = ["cloud-platform"]
  }

  labels = local.labels

  depends_on = [
    google_sql_database_instance.main,
    google_redis_instance.main
  ]
}

# Cloud SQL PostgreSQL Database
resource "google_sql_database_instance" "main" {
  name             = "neurona-db-${var.environment}"
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
  name          = "neurona-private-ip-${var.environment}"
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
  name     = "neurona_user"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# Redis Instance (Memorystore)
resource "google_redis_instance" "main" {
  name           = "neurona-redis-${var.environment}"
  memory_size_gb = var.environment == "production" ? 2 : 1
  tier           = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  region         = var.region

  authorized_network      = google_compute_network.main.id
  transit_encryption_mode = "SERVER_AUTHENTICATION"
  auth_enabled            = true

  redis_version = "REDIS_7_0"
  display_name  = "Neurona Redis ${var.environment}"

  labels = local.labels

  depends_on = [google_project_service.apis]
}

# Service Account for Backend VM
resource "google_service_account" "backend" {
  account_id   = "neurona-backend-${var.environment}"
  display_name = "Neurona Backend Service Account"
}

resource "google_project_iam_member" "backend_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_project_iam_member" "backend_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_project_iam_member" "backend_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# Load Balancer for API domain
resource "google_compute_managed_ssl_certificate" "api" {
  name = "neurona-api-ssl-${var.environment}"

  managed {
    domains = [var.domain_name]
  }
}

resource "google_compute_global_address" "api_lb" {
  name = "neurona-api-lb-ip-${var.environment}"
}

resource "google_compute_backend_service" "api" {
  name        = "neurona-api-backend-${var.environment}"
  protocol    = "HTTP"
  port_name   = "http"
  timeout_sec = 30

  backend {
    group = google_compute_instance_group.backend.id
  }

  health_checks = [google_compute_health_check.api.id]
}

resource "google_compute_instance_group" "backend" {
  name = "neurona-backend-group-${var.environment}"
  zone = var.zone

  instances = [google_compute_instance.backend.id]

  named_port {
    name = "http"
    port = "3000"
  }
}

resource "google_compute_health_check" "api" {
  name               = "neurona-api-healthcheck-${var.environment}"
  timeout_sec        = 5
  check_interval_sec = 30

  http_health_check {
    port         = 3000
    request_path = "/api/health"
  }
}

resource "google_compute_url_map" "api" {
  name            = "neurona-api-urlmap-${var.environment}"
  default_service = google_compute_backend_service.api.id
}

resource "google_compute_target_https_proxy" "api" {
  name             = "neurona-api-https-proxy-${var.environment}"
  url_map          = google_compute_url_map.api.id
  ssl_certificates = [google_compute_managed_ssl_certificate.api.id]
}

resource "google_compute_global_forwarding_rule" "api_https" {
  name       = "neurona-api-https-${var.environment}"
  target     = google_compute_target_https_proxy.api.id
  port_range = "443"
  ip_address = google_compute_global_address.api_lb.address
}

# Outputs
output "backend_ip" {
  description = "Public IP of the backend VM"
  value       = google_compute_address.backend_ip.address
}

output "api_load_balancer_ip" {
  description = "IP address of the API load balancer"
  value       = google_compute_global_address.api_lb.address
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