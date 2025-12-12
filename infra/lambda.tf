# =============================================================================
# Lambda Functions
# =============================================================================

# -----------------------------------------------------------------------------
# IAM Role for Lambda
# -----------------------------------------------------------------------------

resource "aws_iam_role" "lambda_exec" {
  name = "${local.name_prefix}-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_custom" {
  name = "${local.name_prefix}-lambda-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.qr_codes.arn,
          "${aws_dynamodb_table.qr_codes.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.qr_images.arn}/*"
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# Lambda Layer (shared dependencies)
# -----------------------------------------------------------------------------

# TODO: Create Lambda layer with qrcode, Pillow dependencies
# resource "aws_lambda_layer_version" "dependencies" {
#   filename            = "${path.module}/../backend/layer.zip"
#   layer_name          = "${local.name_prefix}-dependencies"
#   compatible_runtimes = ["python3.11"]
# }

# -----------------------------------------------------------------------------
# Create QR Lambda
# -----------------------------------------------------------------------------

resource "aws_lambda_function" "create_qr" {
  filename         = "${path.module}/../backend/create_qr.zip"
  function_name    = "${local.name_prefix}-create-qr"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.qr_codes.name
      S3_BUCKET      = aws_s3_bucket.qr_images.bucket
      API_URL        = aws_apigatewayv2_stage.main.invoke_url
    }
  }

  # TODO: Add layer when deployed
  # layers = [aws_lambda_layer_version.dependencies.arn]
}

# -----------------------------------------------------------------------------
# Redirect Lambda
# -----------------------------------------------------------------------------

resource "aws_lambda_function" "redirect" {
  filename         = "${path.module}/../backend/redirect.zip"
  function_name    = "${local.name_prefix}-redirect"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.qr_codes.name
    }
  }
}

# -----------------------------------------------------------------------------
# Update Destination Lambda
# -----------------------------------------------------------------------------

resource "aws_lambda_function" "update_destination" {
  filename         = "${path.module}/../backend/update_destination.zip"
  function_name    = "${local.name_prefix}-update-destination"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.qr_codes.name
    }
  }
}

# -----------------------------------------------------------------------------
# List QR Lambda
# -----------------------------------------------------------------------------

resource "aws_lambda_function" "list_qr" {
  filename         = "${path.module}/../backend/list_qr.zip"
  function_name    = "${local.name_prefix}-list-qr"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.qr_codes.name
      S3_BUCKET      = aws_s3_bucket.qr_images.bucket
    }
  }
}
