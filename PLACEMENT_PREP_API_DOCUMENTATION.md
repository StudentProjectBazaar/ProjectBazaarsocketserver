# Placement Prep API Documentation

## Overview
Complete CRUD API for managing Placement Preparation topics. All operations are handled by a single Lambda function.

## Base URL
```
https://YOUR_API_GATEWAY_URL.execute-api.ap-south-2.amazonaws.com/default/placement_prep_handler
```

## Endpoints

### 1. GET - List All Topics

**Endpoint:** `GET /`

**Description:** Retrieve all placement prep topics

**Request:**
```http
GET /
```

**Response:**
```json
{
  "success": true,
  "topics": [
    {
      "id": "uuid-here",
      "title": "Data Structures & Algorithms",
      "importance": "Critical",
      "timeNeeded": "3-4 months",
      "resources": [
        {
          "name": "LeetCode",
          "url": "https://leetcode.com",
          "type": "Practice"
        }
      ],
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ],
  "count": 1
}
```

**Alternative (POST with action):**
```http
POST /
Content-Type: application/json

{
  "action": "list"
}
```

---

### 2. GET - Get Single Topic

**Endpoint:** `GET /{id}`

**Description:** Retrieve a single topic by ID

**Request:**
```http
GET /abc123-def456-ghi789
```

**Response (Success):**
```json
{
  "success": true,
  "topic": {
    "id": "abc123-def456-ghi789",
    "title": "Data Structures & Algorithms",
    "importance": "Critical",
    "timeNeeded": "3-4 months",
    "resources": [...],
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Topic with ID 'abc123-def456-ghi789' not found"
}
```

---

### 3. POST - Create Single Topic

**Endpoint:** `POST /`

**Description:** Create a new placement prep topic

**Request:**
```http
POST /
Content-Type: application/json

{
  "title": "System Design",
  "importance": "Important",
  "timeNeeded": "1-2 months",
  "resources": [
    {
      "name": "System Design Primer",
      "url": "https://github.com/donnemartin/system-design-primer",
      "type": "GitHub"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Topic created successfully",
  "topic": {
    "id": "auto-generated-uuid",
    "title": "System Design",
    "importance": "Important",
    "timeNeeded": "1-2 months",
    "resources": [...],
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

**Note:** If you provide an `id` in the request, it will be used. Otherwise, a UUID will be auto-generated.

---

### 4. POST - Bulk Create/Update Topics

**Endpoint:** `POST /`

**Description:** Bulk create or update topics (replaces entire list)

**Request:**
```http
POST /
Content-Type: application/json

{
  "topics": [
    {
      "id": "existing-uuid-1",
      "title": "Data Structures & Algorithms",
      "importance": "Critical",
      "timeNeeded": "3-4 months",
      "resources": [...]
    },
    {
      "id": "existing-uuid-2",
      "title": "System Design",
      "importance": "Important",
      "timeNeeded": "1-2 months",
      "resources": [...]
    },
    {
      "title": "New Topic",
      "importance": "Good to Know",
      "timeNeeded": "2 weeks",
      "resources": [...]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 3 placement topics",
  "count": 3,
  "deleted": 0
}
```

**Note:** 
- Topics with existing IDs will be updated
- Topics without IDs will get new UUIDs
- Topics not in the list will be deleted from the database

**Alternative (POST with action):**
```http
POST /
Content-Type: application/json

{
  "action": "put",
  "topics": [...]
}
```

---

### 5. PUT - Update Single Topic

**Endpoint:** `PUT /{id}`

**Description:** Update an existing topic by ID

**Request:**
```http
PUT /abc123-def456-ghi789
Content-Type: application/json

{
  "title": "Updated Title",
  "importance": "Important",
  "timeNeeded": "2-3 months",
  "resources": [
    {
      "name": "New Resource",
      "url": "https://example.com",
      "type": "Article"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Topic updated successfully",
  "topic": {
    "id": "abc123-def456-ghi789",
    "title": "Updated Title",
    "importance": "Important",
    "timeNeeded": "2-3 months",
    "resources": [...],
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-02T00:00:00"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Topic with ID 'abc123-def456-ghi789' not found"
}
```

**Note:** The `createdAt` field is preserved, only `updatedAt` is changed.

---

### 6. DELETE - Delete Single Topic

**Endpoint:** `DELETE /{id}`

**Description:** Delete a topic by ID

**Request:**
```http
DELETE /abc123-def456-ghi789
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Topic deleted successfully",
  "id": "abc123-def456-ghi789"
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Topic with ID 'abc123-def456-ghi789' not found"
}
```

**Alternative (POST with action):**
```http
POST /
Content-Type: application/json

{
  "action": "delete",
  "id": "abc123-def456-ghi789"
}
```

---

## Data Models

### PlacementTopic
```typescript
interface PlacementTopic {
  id: string;                    // UUID, auto-generated if not provided
  title: string;                 // Required
  importance: "Critical" | "Important" | "Good to Know";  // Default: "Important"
  timeNeeded: string;            // e.g., "3-4 months"
  resources: PlacementResource[]; // Array of resources
  createdAt: string;             // ISO 8601 timestamp, auto-generated
  updatedAt: string;             // ISO 8601 timestamp, auto-updated
}
```

### PlacementResource
```typescript
interface PlacementResource {
  name: string;   // Required
  url: string;    // Required, must be valid URL
  type: string;   // Optional, e.g., "Practice", "Video", "GitHub"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Topic ID is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Topic with ID 'xxx' not found"
}
```

### 405 Method Not Allowed
```json
{
  "success": false,
  "message": "Method PATCH not allowed"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve topics",
  "error": "Error details here"
}
```

---

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With`

---

## Examples

### Example 1: Create a new topic
```bash
curl -X POST https://api.example.com/placement_prep \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data Structures & Algorithms",
    "importance": "Critical",
    "timeNeeded": "3-4 months",
    "resources": [
      {
        "name": "LeetCode",
        "url": "https://leetcode.com",
        "type": "Practice"
      }
    ]
  }'
```

### Example 2: Get all topics
```bash
curl -X GET https://api.example.com/placement_prep
```

### Example 3: Update a topic
```bash
curl -X PUT https://api.example.com/placement_prep/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "importance": "Important",
    "timeNeeded": "2-3 months",
    "resources": []
  }'
```

### Example 4: Delete a topic
```bash
curl -X DELETE https://api.example.com/placement_prep/abc123
```

---

## API Gateway Configuration

For proper routing, configure API Gateway with:

1. **Resource:** `/placement_prep`
2. **Methods:**
   - `GET /placement_prep` → List all
   - `GET /placement_prep/{id}` → Get one
   - `POST /placement_prep` → Create/Bulk update
   - `PUT /placement_prep/{id}` → Update one
   - `DELETE /placement_prep/{id}` → Delete one
   - `OPTIONS /placement_prep` → CORS preflight

3. **Integration:** Lambda Function (placement_prep_handler)

4. **Path Parameters:**
   - `{id}` → String (for GET, PUT, DELETE with ID)

---

## Notes

1. **Bulk Operations:** The bulk update (`POST /` with `topics` array) replaces the entire database. Topics not in the array will be deleted.

2. **ID Generation:** If you don't provide an `id` when creating, a UUID will be auto-generated.

3. **Timestamps:** `createdAt` is set on creation and preserved on update. `updatedAt` is updated on every modification.

4. **Sorting:** When listing all topics, they are sorted by:
   - Importance (Critical > Important > Good to Know)
   - Then alphabetically by title

5. **Validation:** Resources must have both `name` and `url` to be saved. Invalid resources are filtered out.

6. **Error Handling:** All errors return appropriate HTTP status codes and error messages in JSON format.

