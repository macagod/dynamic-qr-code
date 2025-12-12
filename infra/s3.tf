# =============================================================================
# S3 Buckets
# =============================================================================

# -----------------------------------------------------------------------------
# QR Images Bucket
# -----------------------------------------------------------------------------

resource "aws_s3_bucket" "qr_images" {
  bucket = "${local.name_prefix}-qr-images"
}

resource "aws_s3_bucket_public_access_block" "qr_images" {
  bucket = aws_s3_bucket.qr_images.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "qr_images" {
  bucket = aws_s3_bucket.qr_images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.qr_images.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.qr_images]
}

resource "aws_s3_bucket_cors_configuration" "qr_images" {
  bucket = aws_s3_bucket.qr_images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3600
  }
}

# -----------------------------------------------------------------------------
# Frontend Hosting Bucket
# -----------------------------------------------------------------------------

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name_prefix}-frontend"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # SPA fallback
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}
