"""
Lambda handler for QR code redirect.
Looks up destination URL from DynamoDB and returns 302 redirect.
"""
import json
import os

# TODO: Uncomment when deploying to AWS
# import boto3

def lambda_handler(event, context):
    """
    Redirect to destination URL for a given QR code.
    
    Path parameter: qrId
    
    Response: 302 redirect to destination URL
    """
    try:
        # Get QR ID from path parameters
        qr_id = event.get('pathParameters', {}).get('qrId')
        
        if not qr_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'qrId is required'})
            }
        
        # TODO: Look up destination from DynamoDB
        # dynamodb = boto3.resource('dynamodb')
        # table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])
        # response = table.get_item(Key={'qrId': qr_id})
        # item = response.get('Item')
        
        # Placeholder: mock destination lookup
        mock_destinations = {
            'demo123': 'https://github.com',
            'test456': 'https://google.com'
        }
        
        destination = mock_destinations.get(qr_id)
        
        if not destination:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'text/html'},
                'body': '<html><body><h1>QR Code Not Found</h1><p>This QR code does not exist or has been deleted.</p></body></html>'
            }
        
        # TODO: Increment scan count for analytics (future feature)
        
        # Return 302 redirect
        return {
            'statusCode': 302,
            'headers': {
                'Location': destination,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            'body': ''
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
