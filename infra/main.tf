# =============================================================================
# Dynamic QR Code Platform - Main Terraform Configuration
# =============================================================================

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # TODO: Configure remote backend for team collaboration
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "dynamic-qr-code/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "dynamic-qr-code"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# =============================================================================
# Local Values
# =============================================================================

locals {
  project_name = "dynamic-qr-code"
  
  # Resource naming convention: {project}-{resource}-{environment}
  name_prefix = "${local.project_name}-${var.environment}"
}
