# =============================================================================
# DynamoDB Table
# =============================================================================

resource "aws_dynamodb_table" "qr_codes" {
  name         = "${local.name_prefix}-qr-codes"
  billing_mode = "PAY_PER_REQUEST"  # Cost-optimized for MVP
  hash_key     = "qrId"

  attribute {
    name = "qrId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  # Global Secondary Index for querying by userId
  global_secondary_index {
    name            = "userId-index"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  # Enable point-in-time recovery for data protection
  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${local.name_prefix}-qr-codes"
  }
}

# =============================================================================
# Table Schema Reference (for documentation)
# =============================================================================
#
# Primary Key: qrId (String)
# 
# Attributes:
#   - qrId: Unique identifier for the QR code (partition key)
#   - userId: Cognito user sub (used for GSI)
#   - destination: Target URL for redirect
#   - label: User-friendly name
#   - createdAt: ISO 8601 timestamp
#   - updatedAt: ISO 8601 timestamp (optional)
#
# GSI: userId-index
#   - Enables querying all QR codes for a specific user
#
# =============================================================================
