# Portfolio Generator Lambda Setup Guide

## Overview

This Lambda function powers the automated portfolio generation feature. It:
1. Receives a resume (PDF/DOCX)
2. Extracts text from the document
3. Uses OpenAI GPT-4 to extract structured data
4. Generates a React portfolio website
5. Deploys to Vercel
6. Returns the live URL

## Architecture

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Lambda    │────▶│    Vercel    │
│  (React App) │     │  (Python)   │     │  (Deploy)    │
└──────────────┘     └──────┬──────┘     └──────────────┘
                           │
                     ┌─────▼─────┐
                     │  OpenAI   │
                     │   GPT-4   │
                     └───────────┘
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Yes |
| `VERCEL_TOKEN` | Vercel deployment token | Yes |

## Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and save securely

### Vercel Token
1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "Portfolio Generator"
4. Set scope to your account/team
5. Copy and save securely

## Lambda Deployment

### Option 1: AWS Console

1. Go to AWS Lambda Console
2. Create new function:
   - Name: `portfolio-generator`
   - Runtime: Python 3.11
   - Architecture: x86_64

3. Upload the code:
   - Zip the `generate_portfolio.py` file
   - Upload via console or S3

4. Configure environment variables:
   - Add `OPENAI_API_KEY`
   - Add `VERCEL_TOKEN`

5. Configure function:
   - Timeout: 5 minutes (300 seconds)
   - Memory: 512 MB minimum
   - Add API Gateway trigger

### Option 2: AWS CLI

```bash
# Create deployment package
zip function.zip generate_portfolio.py

# Create function
aws lambda create-function \
  --function-name portfolio-generator \
  --runtime python3.11 \
  --handler generate_portfolio.lambda_handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --timeout 300 \
  --memory-size 512 \
  --environment "Variables={OPENAI_API_KEY=sk-xxx,VERCEL_TOKEN=xxx}"

# Create API Gateway
aws apigatewayv2 create-api \
  --name portfolio-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:portfolio-generator
```

### Option 3: Serverless Framework

```yaml
# serverless.yml
service: portfolio-generator

provider:
  name: aws
  runtime: python3.11
  timeout: 300
  memorySize: 512
  environment:
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
    VERCEL_TOKEN: ${env:VERCEL_TOKEN}

functions:
  generatePortfolio:
    handler: generate_portfolio.lambda_handler
    events:
      - http:
          path: /generate-portfolio
          method: post
          cors: true
```

Deploy:
```bash
serverless deploy
```

## API Endpoint

After deployment, update the frontend endpoint in:
`ProjectBazaar/components/BuildPortfolioPage.tsx`

```typescript
const PORTFOLIO_API_ENDPOINT = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/generate-portfolio';
```

## Request Format

```json
{
  "action": "generatePortfolio",
  "userId": "user_123",
  "userEmail": "user@example.com",
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "fileContent": "<base64-encoded-file>"
}
```

## Response Format

### Success
```json
{
  "success": true,
  "stage": "complete",
  "liveUrl": "https://portfolio-user123.vercel.app",
  "previewUrl": "https://portfolio-user123.vercel.app",
  "portfolioData": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message here"
}
```

## PDF Parsing

For production, add these Lambda layers or package these libraries:

### Option A: Lambda Layer with PyPDF2
```bash
pip install PyPDF2 python-docx -t python/
zip -r pdf-layer.zip python/
aws lambda publish-layer-version \
  --layer-name pdf-parser \
  --zip-file fileb://pdf-layer.zip \
  --compatible-runtimes python3.11
```

### Option B: Use Textract (AWS Service)
```python
import boto3

def extract_text_with_textract(file_bytes):
    textract = boto3.client('textract')
    response = textract.detect_document_text(
        Document={'Bytes': file_bytes}
    )
    return ' '.join(
        block['Text'] 
        for block in response['Blocks'] 
        if block['BlockType'] == 'LINE'
    )
```

## Costs Estimate

| Service | Cost |
|---------|------|
| OpenAI GPT-4 | ~$0.03 per resume |
| Lambda | ~$0.0001 per invocation |
| Vercel | Free tier (100 deployments/day) |

## Security Considerations

1. **Rate Limiting**: Add API Gateway throttling
2. **File Validation**: Validate file type and size
3. **User Authentication**: Verify user tokens before processing
4. **CORS**: Restrict to your domain in production

## Monitoring

Add CloudWatch alarms for:
- Error rate > 5%
- Duration > 60 seconds
- Concurrent executions > 10

## Troubleshooting

### "Could not extract text"
- Check file encoding
- Verify PDF is not password-protected
- Check Lambda memory (increase if needed)

### "AI extraction failed"
- Verify OpenAI API key
- Check rate limits
- Review prompt (resume may be too long)

### "Deployment failed"
- Verify Vercel token permissions
- Check deployment quota
- Review error message from Vercel API

