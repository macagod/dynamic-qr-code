"""
Lambda handler for listing user's QR codes.
Returns all QR codes belonging to the authenticated user.
"""
import json
import os

# TODO: Uncomment when deploying to AWS
# import boto3
# from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    """
    List all QR codes for the authenticated user.
    
    Response:
    {
        "qrCodes": [
            {
                "qrId": "abc123",
                "label": "My QR Code",
                "destination": "https://example.com",
                "qrUrl": "https://s3-bucket/qr-images/abc123.png",
                "createdAt": "2024-01-15T10:30:00Z"
            }
        ],
        "total": 1
    }
    """
    try:
        # Get user ID from JWT claims (Cognito)
        user_id = _get_user_id(event)
        
        # TODO: Query DynamoDB for user's QR codes
        # dynamodb = boto3.resource('dynamodb')
        # table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])
        # response = table.query(
        #     IndexName='userId-index',
        #     KeyConditionExpression=Key('userId').eq(user_id)
        # )
        # items = response.get('Items', [])
        
        # Placeholder: mock QR codes
        mock_qr_codes = [
            {
                'qrId': 'demo123',
                'label': 'GitHub Profile',
                'destination': 'https://github.com',
                'qrUrl': 'https://placeholder-bucket.s3.amazonaws.com/qr-images/demo123.png',
                'createdAt': '2024-01-15T10:30:00Z'
            },
            {
                'qrId': 'test456',
                'label': 'Google Search',
                'destination': 'https://google.com',
                'qrUrl': 'https://placeholder-bucket.s3.amazonaws.com/qr-images/test456.png',
                'createdAt': '2024-01-14T08:00:00Z'
            }
        ]
        
        return {
            'statusCode': 200,
            'headers': _cors_headers(),
            'body': json.dumps({
                'qrCodes': mock_qr_codes,
                'total': len(mock_qr_codes)
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
