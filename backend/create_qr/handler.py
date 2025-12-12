"""
Lambda handler for QR code creation.
Generates a QR code PNG and stores it in S3.
"""
import json
import uuid
import os
from datetime import datetime

# TODO: Uncomment when deploying to AWS
# import boto3
# import qrcode
# from io import BytesIO

def lambda_handler(event, context):
    """
    Create a new QR code.
    
    Request body:
    {
        "destination": "https://example.com",
        "label": "My QR Code"
    }
    
    Response:
    {
        "qrId": "abc123",
        "qrUrl": "https://s3-bucket/qr-images/abc123.png",
        "redirectUrl": "https://api-gateway/redirect/abc123"
    }
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        destination = body.get('destination')
        label = body.get('label', 'Untitled QR')
        
        if not destination:
            return {
                'statusCode': 400,
                'headers': _cors_headers(),
                'body': json.dumps({'error': 'destination is required'})
            }
        
        # Get user ID from JWT claims (Cognito)
        user_id = _get_user_id(event)
        
        # Generate unique QR ID
        qr_id = str(uuid.uuid4())[:8]
        
        # TODO: Generate QR code image
        # qr = qrcode.QRCode(version=1, box_size=10, border=4)
        # redirect_url = f"{os.environ['API_URL']}/redirect/{qr_id}"
        # qr.add_data(redirect_url)
        # qr.make(fit=True)
        # img = qr.make_image(fill_color="black", back_color="white")
        
        # TODO: Upload to S3
        # s3 = boto3.client('s3')
        # buffer = BytesIO()
        # img.save(buffer, format='PNG')
        # buffer.seek(0)
        # s3.upload_fileobj(buffer, os.environ['S3_BUCKET'], f"qr-images/{qr_id}.png")
        
        # TODO: Save to DynamoDB
        # dynamodb = boto3.resource('dynamodb')
        # table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])
        # table.put_item(Item={
        #     'qrId': qr_id,
        #     'userId': user_id,
        #     'destination': destination,
        #     'label': label,
        #     'createdAt': datetime.utcnow().isoformat()
        # })
        
        # Placeholder response
        return {
            'statusCode': 201,
            'headers': _cors_headers(),
            'body': json.dumps({
                'qrId': qr_id,
                'qrUrl': f"https://placeholder-bucket.s3.amazonaws.com/qr-images/{qr_id}.png",
                'redirectUrl': f"https://api-placeholder/redirect/{qr_id}",
                'label': label,
                'destination': destination,
                'createdAt': datetime.utcnow().isoformat()
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': _cors_headers(),
            'body': json.dumps({'error': str(e)})
        }


def _get_user_id(event):
    """Extract user ID from Cognito JWT claims."""
    try:
        claims = event['requestContext']['authorizer']['claims']
        return claims['sub']
    except (KeyError, TypeError):
        return 'anonymous'


def _cors_headers():
    """Return CORS headers for API responses."""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    }
