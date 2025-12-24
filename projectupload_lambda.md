
## 3. Upload Project Lambda Function

### Function Name
`projectBazaar-uploadProject`

### HTTP Method
`POST`

### Authentication
Requires JWT token in `Authorization` header: `Bearer <token>`

### Request Parameters

#### Headers:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data (for file uploads)
```

#### Body (multipart/form-data or JSON with file URLs):
```json
{
  // Project Details
  "title": "string (required, min 3, max 200 characters)",
  "category": "string (required, e.g., 'Web Development', 'Mobile App', 'Data Science', 'UI/UX Design', 'Game Development', 'DevOps')",
  "description": "string (required, min 50, max 5000 characters)",
  "tags": "string (required, comma-separated, e.g., 'React, Node.js, MongoDB')",
  
  // Pricing & Media
  "price": "number (required, min 0.01, max 10000, 2 decimal places)",
  "originalPrice": "number (optional, for discount, must be > price)",
  "youtubeVideoUrl": "string (optional, valid YouTube URL format)",
  "documentationUrl": "string (optional, valid URL format)",
  
  // File Uploads (multipart/form-data)
  "thumbnail": "File (required, image: PNG/JPG/GIF, max 10MB)",
  "projectFiles": "File (required, ZIP archive, max 50MB)",
  
  // Additional Media (optional)
  "additionalImages": "File[] (optional, array of images, max 5 images, 10MB each)",
  "demoVideoFile": "File (optional, MP4/WebM, max 100MB)",
  
  // Project Features
  "features": "string[] (optional, array of feature descriptions)",
  "hasDocumentation": "boolean (optional, default: false)",
  "hasExecutionVideo": "boolean (optional, default: false)",
  "isPremium": "boolean (optional, default: false)",
  
  // Technical Details
  "techStack": "string[] (optional, array of technologies used)",
  "difficultyLevel": "string (optional, 'beginner' | 'intermediate' | 'advanced')",
  "estimatedSetupTime": "string (optional, e.g., '30 minutes')",
  
  // Support Information
  "supportInfo": "string (optional, max 1000 characters)",
  "githubUrl": "string (optional, valid GitHub URL)",
  "liveDemoUrl": "string (optional, valid URL)",
  
  // Status (set by system, not user)
  "status": "string (auto-set to 'pending' for review)"
}
```

#### Validation Rules:
- **title**: Required, 3-200 characters, no special characters except spaces, hyphens, underscores
- **category**: Required, must be from predefined list
- **description**: Required, 50-5000 characters
- **tags**: Required, comma-separated, 1-10 tags, each tag 2-30 characters
- **price**: Required, positive number, 2 decimal places, min $0.01, max $10,000
- **originalPrice**: Optional, if provided must be greater than price
- **youtubeVideoUrl**: Optional, must be valid YouTube URL format
- **documentationUrl**: Optional, must be valid URL format
- **thumbnail**: Required, image file (PNG/JPG/GIF), max 10MB
- **projectFiles**: Required, ZIP file, max 50MB
- **userId**: Extracted from JWT token (seller ID)
- **Free tier limit**: Non-premium users can upload max 5 projects
- **Premium users**: Unlimited uploads

### Response Structure

#### Success Response (201):
```json
{
  "success": true,
  "message": "Project uploaded successfully and submitted for review",
  "data": {
    "projectId": "string (UUID)",
    "title": "string",
    "status": "pending",
    "uploadedAt": "string (ISO 8601 timestamp)",
    "estimatedReviewTime": "24-48 hours",
    "thumbnailUrl": "string (S3 URL)",
    "projectFilesUrl": "string (S3 URL)",
    "sellerId": "string (UUID)",
    "sellerName": "string",
    "sellerEmail": "string"
  }
}
```

#### Error Response (400/401/403/409/500):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "FILE_TOO_LARGE" | "INVALID_FILE_TYPE" | "PROJECT_LIMIT_REACHED" | "INTERNAL_SERVER_ERROR",
    "message": "string (error message)",
    "details": {
      "field": "string (field name with error)",
      "reason": "string (specific validation error)"
    }
  }
}
```

### Data to Store in Database

#### Projects Table Structure:
```typescript
interface Project {
  // Primary Identifiers
  projectId: string;              // UUID, primary key
  sellerId: string;                // Foreign key to Users table, indexed
  sellerName: string;              // Denormalized for quick access
  sellerEmail: string;             // Denormalized for quick access
  
  // Project Details
  title: string;                   // Required, indexed for search
  category: string;                 // Required, indexed
  description: string;             // Required
  tags: string[];                   // Array of tags, indexed
  techStack?: string[];            // Optional array of technologies
  
  // Pricing
  price: number;                    // Required, indexed
  originalPrice?: number;          // Optional, for discount display
  currency: string;                 // Default: 'USD'
  
  // Media URLs (stored in S3)
  thumbnailUrl: string;            // Required, S3 URL
  projectFilesUrl: string;         // Required, S3 URL (ZIP)
  additionalImages?: string[];      // Optional array of S3 URLs
  youtubeVideoUrl?: string;        // Optional
  demoVideoUrl?: string;           // Optional, S3 URL
  documentationUrl?: string;       // Optional
  githubUrl?: string;              // Optional
  liveDemoUrl?: string;            // Optional
  
  // Project Features
  features?: string[];             // Optional array of features
  hasDocumentation: boolean;       // Default: false
  hasExecutionVideo: boolean;      // Default: false
  isPremium: boolean;              // Default: false
  difficultyLevel?: string;        // 'beginner' | 'intermediate' | 'advanced'
  estimatedSetupTime?: string;     // e.g., '30 minutes'
  
  // Support Information
  supportInfo?: string;             // Optional support details
  
  // Status & Approval
  status: 'pending' | 'in-review' | 'active' | 'disabled' | 'rejected';  // Default: 'pending'
  adminApproved: boolean;          // Default: false
  adminApprovedBy?: string;       // Admin userId who approved
  adminApprovedAt?: string;       // ISO 8601 timestamp
  rejectionReason?: string;       // If rejected, reason provided by admin
  adminRejectedBy?: string;       // Admin userId who rejected
  adminRejectedAt?: string;       // ISO 8601 timestamp
  
  // Statistics (initialized to 0)
  likesCount: number;              // Default: 0, indexed
  purchasesCount: number;          // Default: 0, indexed
  viewsCount: number;              // Default: 0
  rating?: number;                 // Calculated average rating (1-5)
  totalRatings: number;            // Default: 0
  
  // Financial
  totalRevenue: number;            // Default: 0, calculated from purchases
  totalEarnings: number;           // Default: 0 (after platform commission)
  
  // Timestamps
  uploadedAt: string;              // ISO 8601 timestamp, indexed
  updatedAt: string;               // ISO 8601 timestamp
  publishedAt?: string;            // ISO 8601 timestamp (when status becomes 'active')
  lastPurchasedAt?: string;       // ISO 8601 timestamp
  
  // File Metadata
  thumbnailSize: number;           // File size in bytes
  projectFilesSize: number;        // File size in bytes
  fileFormat: string;              // e.g., 'ZIP', 'TAR.GZ'
  version: string;                 // Default: '1.0.0'
}
```

#### Project Likes Table:
```typescript
interface ProjectLike {
  likeId: string;                  // UUID, primary key
  projectId: string;                // Foreign key to Projects, indexed
  userId: string;                   // Foreign key to Users, indexed
  likedAt: string;                 // ISO 8601 timestamp
  // Composite unique index on (projectId, userId)
}
```

#### Project Purchases Table:
```typescript
interface ProjectPurchase {
  purchaseId: string;               // UUID, primary key
  projectId: string;                // Foreign key to Projects, indexed
  buyerId: string;                  // Foreign key to Users, indexed
  sellerId: string;                 // Foreign key to Users, indexed
  price: number;                    // Price at time of purchase
  currency: string;                 // Default: 'USD'
  paymentMethod: string;            // e.g., 'credit_card', 'paypal', 'stripe'
  paymentTransactionId: string;     // Payment gateway transaction ID
  platformCommission: number;      // Platform fee percentage
  sellerEarnings: number;           // Amount seller receives after commission
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  purchasedAt: string;              // ISO 8601 timestamp, indexed
  downloadedAt?: string;           // ISO 8601 timestamp (when buyer downloads)
  downloadCount: number;            // Default: 0, max 5 downloads
  rating?: number;                  // Optional buyer rating (1-5)
  review?: string;                  // Optional buyer review
  reviewedAt?: string;             // ISO 8601 timestamp
}
```

#### Buyer Information (Denormalized in Purchase):
```typescript
interface BuyerInfo {
  buyerId: string;                  // User ID
  buyerName: string;                // Full name or email
  buyerEmail: string;               // Email address
  buyerAvatar?: string;             // Profile picture URL
  purchaseDate: string;             // ISO 8601 timestamp
  purchasePrice: number;            // Price paid
  downloadCount: number;            // Number of times downloaded
  hasRated: boolean;                // Whether buyer has rated
  rating?: number;                  // Rating given (1-5)
}
```

### Lambda Function Logic:

1. **Authentication & Authorization**:
   - Verify JWT token from Authorization header
   - Extract userId from token
   - Verify user exists and is active
   - Check if user is premium or has available free project slots

2. **Validation**:
   - Validate all required fields
   - Validate file types and sizes
   - Check free tier limit (max 5 projects for non-premium users)
   - Validate URLs format
   - Validate price range

3. **File Upload**:
   - Upload thumbnail to S3 (path: `projects/{projectId}/thumbnail.{ext}`)
   - Upload project files ZIP to S3 (path: `projects/{projectId}/files.zip`)
   - Upload additional images to S3 if provided
   - Generate secure, time-limited download URLs
   - Store S3 URLs in database

4. **Database Operations**:
   - Generate unique projectId (UUID)
   - Create project record with status 'pending'
   - Set adminApproved to false
   - Initialize statistics (likesCount: 0, purchasesCount: 0, etc.)
   - Update seller's projectsCount
   - Create audit log entry

5. **Notifications**:
   - Send email notification to seller confirming upload
   - Send notification to admin team for review
   - Update seller dashboard

6. **Response**:
   - Return projectId and upload confirmation
   - Include estimated review time

### Example Lambda Function Implementation (Node.js/TypeScript):

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

const MAX_FREE_PROJECTS = 5;
const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PROJECT_FILES_SIZE = 50 * 1024 * 1024; // 50MB

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract JWT token
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        })
      };
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
        })
      };
    }

    const sellerId = decoded.userId;
    const sellerEmail = decoded.email;

    // Parse multipart form data (in production, use a library like 'multiparty' or 'busboy')
    // For this example, assuming body is parsed and files are in event.body
    const body = JSON.parse(event.body || '{}');
    const { title, category, description, tags, price, originalPrice, youtubeVideoUrl, documentationUrl, features, hasDocumentation, hasExecutionVideo, isPremium } = body;

    // Validation
    if (!title || title.length < 3 || title.length > 200) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title must be between 3 and 200 characters',
            details: { field: 'title' }
          }
        })
      };
    }

    if (!category) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Category is required',
            details: { field: 'category' }
          }
        })
      };
    }

    if (!description || description.length < 50 || description.length > 5000) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Description must be between 50 and 5000 characters',
            details: { field: 'description' }
          }
        })
      };
    }

    if (!tags || tags.split(',').length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one tag is required',
            details: { field: 'tags' }
          }
        })
      };
    }

    if (!price || price < 0.01 || price > 10000) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Price must be between $0.01 and $10,000',
            details: { field: 'price' }
          }
        })
      };
    }

    // Check user's project count (free tier limit)
    const userResponse = await dynamoClient.send(new GetCommand({
      TableName: 'Users',
      Key: { userId: sellerId }
    }));

    if (!userResponse.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        })
      };
    }

    const user = userResponse.Item;
    if (!user.isPremium && user.projectsCount >= MAX_FREE_PROJECTS) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'PROJECT_LIMIT_REACHED',
            message: `Free tier allows maximum ${MAX_FREE_PROJECTS} projects. Upgrade to Premium for unlimited uploads.`
          }
        })
      };
    }

    // Generate project ID
    const projectId = uuidv4();
    const now = new Date().toISOString();

    // Parse tags
    const tagsArray = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);

    // Upload files to S3 (simplified - in production, handle multipart upload properly)
    // Assuming files are already uploaded and URLs are provided, or handle S3 upload here
    const thumbnailUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/projects/${projectId}/thumbnail.jpg`;
    const projectFilesUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/projects/${projectId}/files.zip`;

    // Create project record
    const project = {
      projectId,
      sellerId,
      sellerName: user.fullName || user.email,
      sellerEmail: user.email,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      tags: tagsArray,
      price: parseFloat(price.toFixed(2)),
      originalPrice: originalPrice ? parseFloat(originalPrice.toFixed(2)) : undefined,
      currency: 'USD',
      thumbnailUrl,
      projectFilesUrl,
      youtubeVideoUrl: youtubeVideoUrl || undefined,
      documentationUrl: documentationUrl || undefined,
      features: features || [],
      hasDocumentation: hasDocumentation || false,
      hasExecutionVideo: hasExecutionVideo || false,
      isPremium: isPremium || false,
      status: 'pending',
      adminApproved: false,
      likesCount: 0,
      purchasesCount: 0,
      viewsCount: 0,
      totalRatings: 0,
      totalRevenue: 0,
      totalEarnings: 0,
      uploadedAt: now,
      updatedAt: now,
      thumbnailSize: 0, // Set from actual file
      projectFilesSize: 0, // Set from actual file
      fileFormat: 'ZIP',
      version: '1.0.0'
    };

    // Save to DynamoDB
    await dynamoClient.send(new PutCommand({
      TableName: 'Projects',
      Item: project
    }));

    // Update user's project count
    await dynamoClient.send(new UpdateCommand({
      TableName: 'Users',
      Key: { userId: sellerId },
      UpdateExpression: 'SET projectsCount = projectsCount + :inc, updatedAt = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': now
      }
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        message: 'Project uploaded successfully and submitted for review',
        data: {
          projectId,
          title: project.title,
          status: 'pending',
          uploadedAt: now,
          estimatedReviewTime: '24-48 hours',
          thumbnailUrl,
          projectFilesUrl,
          sellerId,
          sellerName: project.sellerName,
          sellerEmail: project.sellerEmail
        }
      })
    };
  } catch (error) {
    console.error('Upload project error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while uploading the project'
        }
      })
    };
  }
};
```

### Database Schema (DynamoDB Example)

#### Table: `Projects`

**Primary Key:**
- **Partition Key**: `projectId` (String)

**Global Secondary Indexes (GSI):**
1. **GSI-1**: `sellerId-index`
   - Partition Key: `sellerId` (String)
   - Sort Key: `uploadedAt` (String)
   
2. **GSI-2**: `category-status-index`
   - Partition Key: `category` (String)
   - Sort Key: `status` (String)
   
3. **GSI-3**: `status-uploadedAt-index`
   - Partition Key: `status` (String)
   - Sort Key: `uploadedAt` (String)

#### Table: `ProjectLikes`

**Primary Key:**
- **Partition Key**: `projectId` (String)
- **Sort Key**: `userId` (String)

**Global Secondary Index:**
- **GSI-1**: `userId-index`
  - Partition Key: `userId` (String)
  - Sort Key: `likedAt` (String)

#### Table: `ProjectPurchases`

**Primary Key:**
- **Partition Key**: `purchaseId` (String)

**Global Secondary Indexes:**
1. **GSI-1**: `projectId-index`
   - Partition Key: `projectId` (String)
   - Sort Key: `purchasedAt` (String)
   
2. **GSI-2**: `buyerId-index`
   - Partition Key: `buyerId` (String)
   - Sort Key: `purchasedAt` (String)
   
3. **GSI-3**: `sellerId-index`
   - Partition Key: `sellerId` (String)
   - Sort Key: `purchasedAt` (String)

### Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | User not authorized to upload projects |
| `PROJECT_LIMIT_REACHED` | 403 | Free tier project limit reached |
| `FILE_TOO_LARGE` | 400 | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | 400 | File type not allowed |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Security Considerations

1. **File Upload Security**:
   - Validate file types (MIME type checking)
   - Scan files for malware/viruses
   - Limit file sizes
   - Use secure S3 bucket policies
   - Generate time-limited download URLs

2. **Authentication**:
   - Verify JWT token on every request
   - Check user status (active/suspended)
   - Validate user permissions

3. **Rate Limiting**:
   - Limit uploads per user per day
   - Prevent spam uploads

4. **Content Moderation**:
   - Automatic content scanning
   - Admin review process
   - Report mechanism for inappropriate content

5. **Data Validation**:
   - Sanitize all user inputs
   - Validate URLs
   - Prevent XSS attacks
   - SQL injection prevention (if using SQL database)

---

## Summary

### Signup Lambda Parameters:
- `email` (required)
- `phoneNumber` (required)
- `password` (required)
- `confirmPassword` (required)

### Login Lambda Parameters:
- `email` (required)
- `password` (required)
- `rememberMe` (optional)

### Upload Project Lambda Parameters:
- `title` (required, 3-200 characters)
- `category` (required)
- `description` (required, 50-5000 characters)
- `tags` (required, comma-separated)
- `price` (required, $0.01 - $10,000)
- `thumbnail` (required, image file, max 10MB)
- `projectFiles` (required, ZIP file, max 50MB)
- `youtubeVideoUrl` (optional)
- `documentationUrl` (optional)
- `originalPrice` (optional, for discounts)
- `features` (optional, array)
- Additional optional fields for media, tech stack, support info

### Data to Store:

#### User Data:
- User ID, Email, Phone Number
- Password Hash (never store plain password!)
- Role, Status, Premium status, Credits
- Profile information (name, picture, social links)
- Notification preferences
- Timestamps (created, updated, last login)
- Statistics (projects, earnings, purchases, rating)

#### Project Data:
- Project ID, Title, Category, Description, Tags
- Pricing information (price, originalPrice, currency)
- Media URLs (thumbnail, project files, images, videos)
- Status and Admin Approval (pending, in-review, active, disabled, rejected)
- Statistics (likes count, purchases count, views, ratings)
- Seller information (ID, name, email)
- Timestamps (uploaded, updated, published)
- File metadata (sizes, formats, versions)

#### Project Interactions:
- **Likes**: Project ID, User ID, Timestamp
- **Purchases**: Purchase ID, Project ID, Buyer ID, Seller ID, Price, Payment details, Download count, Ratings/Reviews
- **Buyer Information**: Stored with each purchase for tracking who bought what

