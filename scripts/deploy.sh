#!/bin/bash
# =============================================================================
# Deploy Script - Dynamic QR Code Platform
# =============================================================================
# This script handles deployment of backend and frontend to AWS
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh dev
# =============================================================================

set -e

# Default environment
ENVIRONMENT=${1:-dev}

echo "=========================================="
echo " Dynamic QR Code Platform - Deployment"
echo " Environment: $ENVIRONMENT"
echo "=========================================="

# -----------------------------------------------------------------------------
# 1. Package Backend Lambda Functions
# -----------------------------------------------------------------------------
echo ""
echo "[1/4] Packaging Lambda functions..."

BACKEND_DIR="./backend"
FUNCTIONS=("create_qr" "redirect" "update_destination" "list_qr")

for func in "${FUNCTIONS[@]}"; do
    echo "  - Packaging $func..."
    cd "$BACKEND_DIR/$func"
    zip -r "../$func.zip" handler.py > /dev/null 2>&1
    cd ../..
done

echo "  ✓ Lambda packages created"

# -----------------------------------------------------------------------------
# 2. Deploy Infrastructure with Terraform
# -----------------------------------------------------------------------------
echo ""
echo "[2/4] Deploying infrastructure with Terraform..."

cd infra

# Initialize Terraform (if not already)
terraform init -input=false > /dev/null 2>&1

# Plan and apply
terraform plan -var="environment=$ENVIRONMENT" -out=tfplan > /dev/null 2>&1
terraform apply -auto-approve tfplan > /dev/null 2>&1

# Capture outputs
API_URL=$(terraform output -raw api_gateway_url)
FRONTEND_BUCKET=$(terraform output -raw frontend_url | sed 's|http://||' | cut -d'.' -f1)
COGNITO_POOL_ID=$(terraform output -raw cognito_user_pool_id)
COGNITO_CLIENT_ID=$(terraform output -raw cognito_client_id)

cd ..

echo "  ✓ Infrastructure deployed"
echo "    API URL: $API_URL"

# -----------------------------------------------------------------------------
# 3. Build Frontend
# -----------------------------------------------------------------------------
echo ""
echo "[3/4] Building frontend..."

cd frontend

# Create .env.production with actual values
cat > .env.production << EOF
VITE_API_URL=$API_URL
VITE_COGNITO_USER_POOL_ID=$COGNITO_POOL_ID
VITE_COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
VITE_AWS_REGION=us-east-1
EOF

# Install dependencies and build
npm ci > /dev/null 2>&1
npm run build > /dev/null 2>&1

cd ..

echo "  ✓ Frontend built"

# -----------------------------------------------------------------------------
# 4. Deploy Frontend to S3
# -----------------------------------------------------------------------------
echo ""
echo "[4/4] Deploying frontend to S3..."

aws s3 sync frontend/dist/ s3://$FRONTEND_BUCKET/ \
    --delete \
    --cache-control "max-age=31536000" \
    > /dev/null 2>&1

# Set cache-control for index.html (no cache)
aws s3 cp frontend/dist/index.html s3://$FRONTEND_BUCKET/index.html \
    --cache-control "no-cache, no-store, must-revalidate" \
    > /dev/null 2>&1

FRONTEND_URL="http://$FRONTEND_BUCKET.s3-website-us-east-1.amazonaws.com"

echo "  ✓ Frontend deployed"

# -----------------------------------------------------------------------------
# Done!
# -----------------------------------------------------------------------------
echo ""
echo "=========================================="
echo " Deployment Complete! 🎉"
echo "=========================================="
echo ""
echo " Frontend URL: $FRONTEND_URL"
echo " API URL: $API_URL"
echo ""
echo " Test the redirect:"
echo "   curl -I $API_URL/redirect/demo123"
echo ""
