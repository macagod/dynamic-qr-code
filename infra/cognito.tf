# =============================================================================
# AWS Cognito User Pool
# =============================================================================

resource "aws_cognito_user_pool" "main" {
  name = "${local.name_prefix}-users"

  # Username configuration
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Schema attributes
  schema {
    name                     = "email"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 5
      max_length = 256
    }
  }

  # MVP: Skip email verification for faster onboarding
  # TODO: Enable for production
  # verification_message_template {
  #   default_email_option = "CONFIRM_WITH_CODE"
  # }

  tags = {
    Name = "${local.name_prefix}-users"
  }
}

# =============================================================================
# Cognito User Pool Client
# =============================================================================

resource "aws_cognito_user_pool_client" "main" {
  name         = "${local.name_prefix}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Token configuration
  access_token_validity  = 1   # hours
  id_token_validity      = 1   # hours
  refresh_token_validity = 30  # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # Security
  prevent_user_existence_errors = "ENABLED"
  generate_secret               = false  # Required for SPA

  # Supported identity providers
  supported_identity_providers = ["COGNITO"]
}
