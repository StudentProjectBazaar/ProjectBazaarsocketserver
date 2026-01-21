# Bids and Freelancers API Setup Guide

This guide explains how to deploy the new Lambda functions for the Bids and Freelancers APIs.

## Overview

Two new Lambda functions have been created:

1. **bids_handler.py** - Manages project bids/proposals (CRUD operations)
2. **freelancers_handler.py** - Fetches seller/freelancer profiles from the Users table

## DynamoDB Table Setup

### Bids Table

Create a new DynamoDB table with the following configuration:

```
Table Name: Bids
Primary Key: bidId (String)

Global Secondary Indexes (GSI):
1. projectId-index
   - Partition Key: projectId (String)
   - Sort Key: submittedAt (String)
   
2. freelancerId-index
   - Partition Key: freelancerId (String)
   - Sort Key: submittedAt (String)
```

**Table Schema:**
```json
{
  "bidId": "string (PK)",
  "projectId": "string",
  "freelancerId": "string",
  "freelancerName": "string",
  "freelancerEmail": "string",
  "bidAmount": "number",
  "currency": "string",
  "deliveryTime": "number",
  "deliveryTimeUnit": "string (days|weeks|months)",
  "proposal": "string",
  "status": "string (pending|accepted|rejected)",
  "submittedAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

## Lambda Function Deployment

### 1. bids_handler Lambda

**Create Lambda Function:**
- Name: `bids_handler` (or your preferred name)
- Runtime: Python 3.9+
- Handler: `bids_handler.lambda_handler`
- Memory: 256 MB
- Timeout: 30 seconds

**IAM Permissions Required:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/Bids",
        "arn:aws:dynamodb:*:*:table/Bids/index/*"
      ]
    }
  ]
}
```

**API Gateway Setup:**
- Create HTTP API or REST API
- Route: POST /bids
- Enable CORS

**Supported Actions:**
- `CREATE_BID` - Create a new bid
- `GET_BIDS_BY_PROJECT` - Get all bids for a project
- `GET_BIDS_BY_FREELANCER` - Get all bids by a freelancer
- `GET_BID` - Get a single bid
- `UPDATE_BID_STATUS` - Accept/reject a bid
- `DELETE_BID` - Delete a bid
- `CHECK_EXISTING_BID` - Check if freelancer already bid

### 2. freelancers_handler Lambda

**Create Lambda Function:**
- Name: `freelancers_handler` (or your preferred name)
- Runtime: Python 3.9+
- Handler: `freelancers_handler.lambda_handler`
- Memory: 512 MB (needs more memory for scanning)
- Timeout: 30 seconds

**IAM Permissions Required:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/Users",
        "arn:aws:dynamodb:*:*:table/Projects"
      ]
    }
  ]
}
```

**API Gateway Setup:**
- Create HTTP API or REST API
- Route: GET/POST /freelancers
- Enable CORS

**Supported Actions:**
- `GET_ALL_FREELANCERS` - Get all freelancers with pagination
- `GET_FREELANCER_BY_ID` - Get a specific freelancer's profile
- `GET_TOP_FREELANCERS` - Get top-rated freelancers
- `SEARCH_FREELANCERS` - Search by skills, name, location

## Frontend Configuration

After deploying the Lambda functions, update the API endpoints in:

### 1. `services/bidsService.ts`
```typescript
const BIDS_API_ENDPOINT = 'https://YOUR_API_ID.execute-api.ap-south-2.amazonaws.com/default/bids_handler';
```

### 2. `services/freelancersApi.ts`
```typescript
const FREELANCERS_API_ENDPOINT = 'https://YOUR_API_ID.execute-api.ap-south-2.amazonaws.com/default/freelancers_handler';
```

## Testing

### Test Bids API:
```bash
# Create a bid
curl -X POST https://YOUR_API_ID.execute-api.ap-south-2.amazonaws.com/default/bids_handler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "CREATE_BID",
    "projectId": "proj-123",
    "freelancerId": "user-456",
    "freelancerName": "John Doe",
    "freelancerEmail": "john@example.com",
    "bidAmount": 500,
    "currency": "USD",
    "deliveryTime": 7,
    "deliveryTimeUnit": "days",
    "proposal": "I can complete this project..."
  }'

# Get bids for a project
curl -X POST https://YOUR_API_ID.execute-api.ap-south-2.amazonaws.com/default/bids_handler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "GET_BIDS_BY_PROJECT",
    "projectId": "proj-123"
  }'
```

### Test Freelancers API:
```bash
# Get all freelancers
curl -X POST https://YOUR_API_ID.execute-api.ap-south-2.amazonaws.com/default/freelancers_handler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "GET_ALL_FREELANCERS",
    "limit": 20
  }'

# Get top freelancers
curl -X POST https://YOUR_API_ID.execute-api.ap-south-2.amazonaws.com/default/freelancers_handler \
  -H "Content-Type: application/json" \
  -d '{
    "action": "GET_TOP_FREELANCERS",
    "limit": 6
  }'
```

## Fallback Behavior

Both the frontend services are designed with fallback behavior:

1. **bidsService.ts** - Falls back to localStorage if API is unavailable
2. **freelancersApi.ts** - Falls back to mock data (`mock/freelancers.json`) if API fails

This ensures the application remains functional even during API outages.

## Environment Variables (Optional)

You can configure these Lambda environment variables:

```
BIDS_TABLE_NAME=Bids
USERS_TABLE_NAME=Users
PROJECTS_TABLE_NAME=Projects
```

Then update the Lambda code to use:
```python
import os
bids_table = dynamodb.Table(os.environ.get('BIDS_TABLE_NAME', 'Bids'))
```
