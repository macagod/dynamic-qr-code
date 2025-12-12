"""
Lambda handler for updating QR code destination.
Updates the destination URL in DynamoDB without regenerating the QR image.
"""
import json
import os
from datetime import datetime

# TODO: Uncomment when deploying to AWS
# import boto3

def lambda_handler(event, context):
    """
    Update destination URL for an existing QR code.
    
    Path parameter: qrId
    Request body:
    {
        "destination": "https://new-destination.com"
    }
    
    Response:
    {
        "qrId": "abc123",
        "destination": "https://new-destination.com",
        "updatedAt": "2024-01-15T10:30:00Z"
    }
    """
    try:
        # Get QR ID from path parameters
        qr_id = event.get('pathParameters', {}).get('qrId')
        
        if not qr_id:
            return {
                'statusCode': 400,
                'headers': _cors_headers(),
                'body': json.dumps({'error': 'qrId is required'})
            }
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        new_destination = body.get('destination')
        
        if not new_destination:
            return {
                'statusCode': 400,
                'headers': _cors_headers(),
                'body': json.dumps({'error': 'destination is required'})
            }
        
        # Get user ID from JWT claims (Cognito)
        user_id = _get_user_id(event)
        
        # TODO: Verify ownership and update in DynamoDB
        # dynamodb = boto3.resource('dynamodb')
        # table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])
        # 
        # # First verify the QR belongs to this user
        # response = table.get_item(Key={'qrId': qr_id})
        # item = response.get('Item')
        # 
        # if not item:
        #     return {'statusCode': 404, 'body': json.dumps({'error': 'QR code not found'})}
        # 
        # if item['userId'] != user_id:
        #     return {'statusCode': 403, 'body': json.dumps({'error': 'Not authorized'})}
        # 
        # # Update destination
        # table.update_item(
        #     Key={'qrId': qr_id},
        #     UpdateExpression='SET destination = :dest, updatedAt = :updated',
        #     ExpressionAttributeValues={
        #         ':dest': new_destination,
        #         ':updated': datetime.utcnow().isoformat()
        #     }
        # )
        
        # Placeholder response
        return {
            'statusCode': 200,
            'headers': _cors_headers(),
            'body': json.dumps({
                'qrId': qr_id,
                'destination': new_destination,
                'updatedAt': datetime.utcnow().isoformat()
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
