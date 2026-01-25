# Career Guidance Database Structure

## Overview
The database now supports **multiple duration programs** for the same category. Each user can complete a 2-week, 4-week, or 8-week program for any category (e.g., Web Development) and each will have **separate progress tracking** and **separate certificates**.

**⚠️ IMPORTANT:** The `duration` parameter is **REQUIRED** in all API calls. There are **NO DEFAULT VALUES** (e.g., no default of 8). Everything is **fully dynamic** based on the user's selected program duration.

---

## DynamoDB Tables

### 1. `CareerGuidanceUserProgress` Table

**Primary Key:**
- Partition Key: `userId` (String)
- Sort Key: `categoryId` (String)

**Data Structure (NEW - Nested by Duration):**
```json
{
  "userId": "user-abc-123",
  "userName": "John Doe",
  "categoryId": "web-development",
  "categoryName": "Web Development",
  "durations": {
    "2": {
      "duration": 2,
      "weeksProgress": [
        {
          "weekNumber": 1,
          "isCompleted": true,
          "quizCompleted": true,
          "quizScore": 85,
          "completedAt": "2026-01-20T10:30:00.000Z"
        },
        {
          "weekNumber": 2,
          "isCompleted": true,
          "quizCompleted": true,
          "quizScore": 90,
          "completedAt": "2026-01-26T14:20:00.000Z"
        }
      ],
      "overallProgress": 100,
      "isRoadmapCompleted": true,
      "certificateId": "cert-uuid-for-2-weeks",
      "certificateIssuedAt": "2026-01-26T14:25:00.000Z",
      "finalScore": 87,
      "startedAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-01-26T14:25:00.000Z"
    },
    "8": {
      "duration": 8,
      "weeksProgress": [
        {
          "weekNumber": 1,
          "isCompleted": true,
          "quizCompleted": true,
          "quizScore": 88,
          "completedAt": "2026-01-18T11:00:00.000Z"
        },
        {
          "weekNumber": 2,
          "isCompleted": true,
          "quizCompleted": true,
          "quizScore": 92,
          "completedAt": "2026-01-22T16:30:00.000Z"
        }
        // ... weeks 3-8 would be here
      ],
      "overallProgress": 25,
      "isRoadmapCompleted": false,
      "startedAt": "2026-01-10T09:00:00.000Z",
      "updatedAt": "2026-01-22T16:30:00.000Z"
    }
  },
  "createdAt": "2026-01-10T09:00:00.000Z",
  "updatedAt": "2026-01-26T14:25:00.000Z"
}
```

**Key Points:**
- One record per `userId + categoryId` combination
- Multiple durations stored in nested `durations` object
- Each duration has its own `weeksProgress`, `isRoadmapCompleted`, and `certificateId`
- Data for 2-week program NEVER overwrites 8-week program

---

### 2. `CareerGuidanceCertificates` Table

**Primary Key:**
- Partition Key: `certificateId` (String)

**Data Structure (UPDATED - Includes Duration):**
```json
{
  "certificateId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-abc-123",
  "userName": "John Doe",
  "categoryId": "web-development",
  "categoryName": "Web Development",
  "duration": 2,  // ← NEW: Makes certificate unique per duration
  "score": 87,
  "accuracy": 87,
  "totalWeeks": 2,
  "completedWeeks": 2,
  "issuedAt": "2026-01-26T14:25:00.000Z",
  "issuedDate": "January 26, 2026",
  "verificationCode": "CG-550E8400",
  "status": "Passed"
}
```

**Key Points:**
- Separate certificate for each `userId + categoryId + duration` combination
- User can have multiple certificates for same category (different durations)
- Example: One certificate for 2-week Web Dev, another for 8-week Web Dev

---

## API Actions Updated

### 1. `get_progress`
**Request:**
```json
{
  "action": "get_progress",
  "userId": "user-abc-123",
  "categoryId": "web-development",
  "duration": 2  // ← REQUIRED for specific duration data (dynamic, no defaults)
}
```

**Response (with duration):**
```json
{
  "success": true,
  "progress": {
    "userId": "user-abc-123",
    "userName": "John Doe",
    "categoryId": "web-development",
    "categoryName": "Web Development",
    "duration": 2,
    "weeksProgress": [...],
    "overallProgress": 100,
    "isRoadmapCompleted": true,
    "certificateId": "cert-uuid-for-2-weeks"
  }
}
```

---

### 2. `save_progress`
**Request:**
```json
{
  "action": "save_progress",
  "userId": "user-abc-123",
  "userName": "John Doe",
  "categoryId": "web-development",
  "categoryName": "Web Development",
  "duration": 2,  // ← REQUIRED - Determines which nested duration to update (dynamic, no defaults)
  "weeksProgress": [...]
}
```

---

### 3. `validate_quiz`
**Request:**
```json
{
  "action": "validate_quiz",
  "userId": "user-abc-123",
  "userName": "John Doe",
  "categoryId": "web-development",
  "weekNumber": 1,
  "duration": 2,  // ← REQUIRED - Updates correct duration's progress (dynamic, no defaults)
  "userAnswers": [...]
}
```

---

### 4. `mark_week_completed`
**Request:**
```json
{
  "action": "mark_week_completed",
  "userId": "user-abc-123",
  "userName": "John Doe",
  "categoryId": "web-development",
  "weekNumber": 1,
  "duration": 2  // ← REQUIRED - Marks week complete for specific duration (dynamic, no defaults)
}
```

---

### 5. `generate_certificate`
**Request:**
```json
{
  "action": "generate_certificate",
  "userId": "user-abc-123",
  "userName": "John Doe",
  "categoryId": "web-development",
  "categoryName": "Web Development",
  "duration": 2,  // ← REQUIRED - Creates certificate for specific duration (dynamic, no defaults)
  "score": 87
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated successfully for 2-week Web Development program",
  "certificate": {
    "certificateId": "...",
    "duration": 2,
    ...
  }
}
```

---

## Example User Journey

**User: John Doe (userId: "user-123")**

### Scenario 1: Complete 2-Week Web Development
1. Starts 2-week Web Development program
2. Completes Week 1 quiz (85%)
3. Completes Week 2 quiz (90%)
4. Gets certificate for 2-week program
5. Database stores in `durations.2.*`

### Scenario 2: Later, Start 8-Week Web Development
1. John decides to do the full 8-week program
2. Starts 8-week Web Development program
3. Data stored in `durations.8.*`
4. **Previous 2-week data in `durations.2.*` is NOT affected**
5. Upon completion, gets a separate certificate for 8-week program

### Final State:
```json
{
  "userId": "user-123",
  "categoryId": "web-development",
  "durations": {
    "2": {
      "isRoadmapCompleted": true,
      "certificateId": "cert-2-weeks",
      "finalScore": 87
    },
    "8": {
      "isRoadmapCompleted": true,
      "certificateId": "cert-8-weeks",
      "finalScore": 92
    }
  }
}
```

**Certificates Table:**
- Certificate #1: 2-week Web Development (duration: 2)
- Certificate #2: 8-week Web Development (duration: 8)

---

## Benefits

✅ **No Data Overwriting**: Each duration program has isolated data  
✅ **Multiple Certificates**: Users can earn certificates for different durations  
✅ **Flexible Learning Paths**: Users can do short then long programs  
✅ **Better Analytics**: Track completion rates per duration  
✅ **Backward Compatible**: Old code structure maintained in responses  

---

## Migration Notes

- Existing data without nested `durations` will still work
- Lambda checks for both old and new structure
- Responses include backward-compatible format when duration specified
- No database schema change needed (DynamoDB is schema-less)

