import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from datetime import datetime
import uuid

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
questions_table = dynamodb.Table('CodingQuestions')  # Main questions table
test_cases_table = dynamodb.Table('CodingTestCases')  # Test cases table (optional, can be embedded)

# Response helper function
def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }


# ========================================
# CREATE QUESTION
# ========================================
def create_question(body):
    """
    Create a new coding question with all details.
    """
    try:
        # Generate unique ID
        question_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Validate required fields
        title = body.get('title', '').strip()
        description = body.get('description', '').strip()
        
        if not title:
            return response(400, {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Title is required"
                }
            })
        
        if not description:
            return response(400, {
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Description is required"
                }
            })
        
        # Build question item
        question_item = {
            "questionId": question_id,
            "title": title,
            "description": description,
            "difficulty": body.get('difficulty', 'Medium'),
            "topic": body.get('topic', 'General'),
            "companies": body.get('companies', []),
            "constraints": body.get('constraints', []),
            "inputFormat": body.get('inputFormat', ''),
            "outputFormat": body.get('outputFormat', ''),
            "examples": body.get('examples', []),
            "hints": body.get('hints', []),
            "testCases": body.get('testCases', []),
            "starterCode": body.get('starterCode', {
                "python": "def solution():\n    pass",
                "javascript": "function solution() {\n}",
                "java": "class Solution {\n}",
                "cpp": "class Solution {\n};",
                "typescript": "function solution(): void {\n}"
            }),
            "solution": body.get('solution', ''),
            "avgTime": body.get('avgTime', 30),
            "status": body.get('status', 'draft'),
            "createdAt": timestamp,
            "updatedAt": timestamp,
            "createdBy": body.get('createdBy', 'admin'),
            # Search and filter indexes
            "difficultyTopic": f"{body.get('difficulty', 'Medium')}#{body.get('topic', 'General')}",
            "statusDifficulty": f"{body.get('status', 'draft')}#{body.get('difficulty', 'Medium')}"
        }
        
        # Add test case IDs for referencing
        for i, tc in enumerate(question_item['testCases']):
            if 'id' not in tc:
                tc['id'] = f"tc-{i+1}"
        
        # Store in DynamoDB
        questions_table.put_item(Item=question_item)
        
        return response(201, {
            "success": True,
            "message": "Question created successfully",
            "data": {
                "questionId": question_id,
                "title": title,
                "status": question_item['status'],
                "createdAt": timestamp
            }
        })
        
    except Exception as e:
        print(f"Error creating question: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Failed to create question"
            }
        })


# ========================================
# GET SINGLE QUESTION
# ========================================
def get_question(question_id):
    """
    Get a single question by ID with all details.
    """
    if not question_id:
        return response(400, {
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Question ID is required"
            }
        })
    
    try:
        result = questions_table.get_item(Key={"questionId": question_id})
        
        if 'Item' not in result:
            return response(404, {
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Question not found"
                }
            })
        
        return response(200, {
            "success": True,
            "data": result['Item']
        })
        
    except Exception as e:
        print(f"Error getting question: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Failed to retrieve question"
            }
        })


# ========================================
# GET ALL QUESTIONS (with filters)
# ========================================
def get_questions(params):
    """
    Get all questions with optional filtering and pagination.
    """
    try:
        # Parse filter parameters
        difficulty = params.get('difficulty', 'all')
        topic = params.get('topic', 'all')
        status = params.get('status', 'all')
        search = params.get('search', '').lower()
        limit = int(params.get('limit', 50))
        last_key = params.get('lastKey')
        
        # Build scan parameters
        scan_kwargs = {
            'Limit': limit
        }
        
        # Build filter expression
        filter_expressions = []
        expression_values = {}
        expression_names = {}
        
        if difficulty != 'all':
            filter_expressions.append("#diff = :difficulty")
            expression_values[':difficulty'] = difficulty
            expression_names['#diff'] = 'difficulty'
        
        if topic != 'all':
            filter_expressions.append("topic = :topic")
            expression_values[':topic'] = topic
        
        if status != 'all':
            filter_expressions.append("#st = :status")
            expression_values[':status'] = status
            expression_names['#st'] = 'status'
        
        if filter_expressions:
            scan_kwargs['FilterExpression'] = ' AND '.join(filter_expressions)
            scan_kwargs['ExpressionAttributeValues'] = expression_values
            if expression_names:
                scan_kwargs['ExpressionAttributeNames'] = expression_names
        
        if last_key:
            scan_kwargs['ExclusiveStartKey'] = json.loads(last_key)
        
        # Execute scan
        result = questions_table.scan(**scan_kwargs)
        
        items = result.get('Items', [])
        
        # Apply text search filter (client-side for simplicity)
        if search:
            items = [
                item for item in items 
                if search in item.get('title', '').lower() or 
                   search in item.get('description', '').lower()
            ]
        
        # Sort by updatedAt descending
        items.sort(key=lambda x: x.get('updatedAt', ''), reverse=True)
        
        return response(200, {
            "success": True,
            "data": {
                "questions": items,
                "count": len(items),
                "lastKey": result.get('LastEvaluatedKey')
            }
        })
        
    except Exception as e:
        print(f"Error getting questions: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Failed to retrieve questions"
            }
        })


# ========================================
# UPDATE QUESTION
# ========================================
def update_question(question_id, body):
    """
    Update an existing question.
    """
    if not question_id:
        return response(400, {
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Question ID is required"
            }
        })
    
    try:
        # Check if question exists
        existing = questions_table.get_item(Key={"questionId": question_id})
        if 'Item' not in existing:
            return response(404, {
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Question not found"
                }
            })
        
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Build update expression
        update_parts = []
        expression_values = {':updatedAt': timestamp}
        expression_names = {}
        
        # Fields that can be updated (map to expression attribute names if reserved)
        # Using expression attribute names for all fields to avoid reserved word issues
        updatable_fields = {
            'title': '#title',
            'description': '#desc',
            'difficulty': '#diff',
            'topic': '#topic',
            'companies': '#companies',
            'constraints': '#constraints',
            'inputFormat': '#inputFormat',
            'outputFormat': '#outputFormat',
            'examples': '#examples',
            'hints': '#hints',
            'testCases': '#testCases',
            'starterCode': '#starterCode',
            'solution': '#solution',
            'avgTime': '#avgTime',
            'status': '#status'
        }
        
        for field, attr_name in updatable_fields.items():
            if field in body and body[field] is not None:
                value = body[field]
                
                # Convert avgTime to int if it's a string
                if field == 'avgTime':
                    try:
                        value = int(value) if isinstance(value, str) else value
                    except (ValueError, TypeError):
                        value = 30  # Default
                
                # Skip empty strings for text fields
                if isinstance(value, str) and value == '' and field not in ['solution']:
                    continue
                
                expression_names[attr_name] = field
                update_parts.append(f"{attr_name} = :{field}")
                expression_values[f':{field}'] = value
        
        # Always update timestamp
        expression_names['#updatedAt'] = 'updatedAt'
        update_parts.append("#updatedAt = :updatedAt")
        
        # Update composite indexes if needed
        if 'difficulty' in body or 'topic' in body:
            diff = body.get('difficulty', existing['Item'].get('difficulty', 'Medium'))
            topic = body.get('topic', existing['Item'].get('topic', 'General'))
            expression_names['#diffTopic'] = 'difficultyTopic'
            update_parts.append("#diffTopic = :diffTopic")
            expression_values[':diffTopic'] = f"{diff}#{topic}"
        
        if 'status' in body or 'difficulty' in body:
            status = body.get('status', existing['Item'].get('status', 'draft'))
            diff = body.get('difficulty', existing['Item'].get('difficulty', 'Medium'))
            expression_names['#statusDiff'] = 'statusDifficulty'
            update_parts.append("#statusDiff = :statusDiff")
            expression_values[':statusDiff'] = f"{status}#{diff}"
        
        update_expression = "SET " + ", ".join(update_parts)
        
        print(f"Update expression: {update_expression}")
        print(f"Expression names: {expression_names}")
        print(f"Expression values keys: {list(expression_values.keys())}")
        
        update_kwargs = {
            'Key': {"questionId": question_id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_values,
            'ExpressionAttributeNames': expression_names,
            'ReturnValues': 'ALL_NEW'
        }
        
        result = questions_table.update_item(**update_kwargs)
        
        return response(200, {
            "success": True,
            "message": "Question updated successfully",
            "data": result['Attributes']
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error updating question: {str(e)}")
        print(f"Traceback: {error_details}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"Failed to update question: {str(e)}"
            }
        })


# ========================================
# DELETE QUESTION
# ========================================
def delete_question(question_id):
    """
    Delete a question by ID.
    """
    if not question_id:
        return response(400, {
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Question ID is required"
            }
        })
    
    try:
        # Check if exists
        existing = questions_table.get_item(Key={"questionId": question_id})
        if 'Item' not in existing:
            return response(404, {
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Question not found"
                }
            })
        
        questions_table.delete_item(Key={"questionId": question_id})
        
        return response(200, {
            "success": True,
            "message": "Question deleted successfully"
        })
        
    except Exception as e:
        print(f"Error deleting question: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Failed to delete question"
            }
        })


# ========================================
# BULK IMPORT QUESTIONS
# ========================================
def bulk_import_questions(body):
    """
    Import multiple questions at once.
    """
    questions = body.get('questions', [])
    
    if not questions:
        return response(400, {
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Questions array is required"
            }
        })
    
    try:
        timestamp = datetime.utcnow().isoformat() + "Z"
        created_ids = []
        errors = []
        
        with questions_table.batch_writer() as batch:
            for i, q in enumerate(questions):
                try:
                    question_id = str(uuid.uuid4())
                    
                    if not q.get('title') or not q.get('description'):
                        errors.append({
                            "index": i,
                            "error": "Title and description are required"
                        })
                        continue
                    
                    question_item = {
                        "questionId": question_id,
                        "title": q.get('title', ''),
                        "description": q.get('description', ''),
                        "difficulty": q.get('difficulty', 'Medium'),
                        "topic": q.get('topic', 'General'),
                        "companies": q.get('companies', []),
                        "constraints": q.get('constraints', []),
                        "inputFormat": q.get('inputFormat', ''),
                        "outputFormat": q.get('outputFormat', ''),
                        "examples": q.get('examples', []),
                        "hints": q.get('hints', []),
                        "testCases": q.get('testCases', []),
                        "starterCode": q.get('starterCode', {}),
                        "solution": q.get('solution', ''),
                        "avgTime": q.get('avgTime', 30),
                        "status": q.get('status', 'draft'),
                        "createdAt": timestamp,
                        "updatedAt": timestamp,
                        "createdBy": body.get('createdBy', 'admin'),
                        "difficultyTopic": f"{q.get('difficulty', 'Medium')}#{q.get('topic', 'General')}",
                        "statusDifficulty": f"{q.get('status', 'draft')}#{q.get('difficulty', 'Medium')}"
                    }
                    
                    batch.put_item(Item=question_item)
                    created_ids.append(question_id)
                    
                except Exception as e:
                    errors.append({
                        "index": i,
                        "error": str(e)
                    })
        
        return response(200, {
            "success": True,
            "message": f"Imported {len(created_ids)} questions",
            "data": {
                "createdIds": created_ids,
                "successCount": len(created_ids),
                "errorCount": len(errors),
                "errors": errors
            }
        })
        
    except Exception as e:
        print(f"Error bulk importing: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Failed to import questions"
            }
        })


# ========================================
# UPDATE QUESTION STATUS (Publish/Archive)
# ========================================
def update_status(question_id, new_status):
    """
    Update the status of a question (publish, archive, draft).
    """
    if not question_id:
        return response(400, {
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Question ID is required"
            }
        })
    
    if new_status not in ['draft', 'published', 'archived']:
        return response(400, {
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Status must be 'draft', 'published', or 'archived'"
            }
        })
    
    try:
        existing = questions_table.get_item(Key={"questionId": question_id})
        if 'Item' not in existing:
            return response(404, {
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Question not found"
                }
            })
        
        timestamp = datetime.utcnow().isoformat() + "Z"
        difficulty = existing['Item'].get('difficulty', 'Medium')
        
        result = questions_table.update_item(
            Key={"questionId": question_id},
            UpdateExpression="SET #st = :status, updatedAt = :updatedAt, statusDifficulty = :statusDiff",
            ExpressionAttributeNames={'#st': 'status'},
            ExpressionAttributeValues={
                ':status': new_status,
                ':updatedAt': timestamp,
                ':statusDiff': f"{new_status}#{difficulty}"
            },
            ReturnValues='ALL_NEW'
        )
        
        return response(200, {
            "success": True,
            "message": f"Question status updated to {new_status}",
            "data": result['Attributes']
        })
        
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Failed to update status"
            }
        })


# ========================================
# GET QUESTIONS BY TOPIC (for user-facing)
# ========================================
def get_questions_by_topic(topic, status='published'):
    """
    Get questions filtered by topic (for user-facing pages).
    """
    try:
        result = questions_table.scan(
            FilterExpression="topic = :topic AND #st = :status",
            ExpressionAttributeNames={'#st': 'status'},
            ExpressionAttributeValues={
                ':topic': topic,
                ':status': status
            }
        )
        
        questions = result.get('Items', [])
        
        # Return minimal data for listing
        simplified = [{
            'questionId': q['questionId'],
            'title': q['title'],
            'difficulty': q['difficulty'],
            'topic': q['topic'],
            'companies': q.get('companies', []),
            'avgTime': q.get('avgTime', 30)
        } for q in questions]
        
        return response(200, {
            "success": True,
            "data": {
                "questions": simplified,
                "count": len(simplified)
            }
        })
        
    except Exception as e:
        print(f"Error getting questions by topic: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Failed to retrieve questions"
            }
        })


# ========================================
# GET STATISTICS
# ========================================
def get_statistics():
    """
    Get statistics about coding questions.
    """
    try:
        result = questions_table.scan(
            ProjectionExpression="questionId, difficulty, #st, topic",
            ExpressionAttributeNames={'#st': 'status'}
        )
        
        items = result.get('Items', [])
        
        stats = {
            "total": len(items),
            "byStatus": {
                "draft": 0,
                "published": 0,
                "archived": 0
            },
            "byDifficulty": {
                "Easy": 0,
                "Medium": 0,
                "Hard": 0
            },
            "byTopic": {}
        }
        
        for item in items:
            status = item.get('status', 'draft')
            difficulty = item.get('difficulty', 'Medium')
            topic = item.get('topic', 'General')
            
            if status in stats['byStatus']:
                stats['byStatus'][status] += 1
            
            if difficulty in stats['byDifficulty']:
                stats['byDifficulty'][difficulty] += 1
            
            if topic not in stats['byTopic']:
                stats['byTopic'][topic] = 0
            stats['byTopic'][topic] += 1
        
        return response(200, {
            "success": True,
            "data": stats
        })
        
    except Exception as e:
        print(f"Error getting statistics: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Failed to retrieve statistics"
            }
        })


# ========================================
# LAMBDA HANDLER
# ========================================
def lambda_handler(event, context):
    try:
        # Handle CORS preflight - check multiple possible locations
        http_method = (
            event.get('httpMethod') or 
            event.get('requestContext', {}).get('http', {}).get('method') or
            'GET'
        )
        
        if http_method == 'OPTIONS':
            return response(200, {})
        
        # Parse request body
        body = {}
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        elif event.get('body'):
            body = event['body']
        
        # Get parameters
        path_params = event.get('pathParameters') or {}
        query_params = event.get('queryStringParameters') or {}
        
        question_id = path_params.get('questionId') or body.get('questionId') or query_params.get('questionId')
        action = body.get('action', '').lower() or query_params.get('action', '').lower()
        
        print(f"Action: {action}, HTTP Method: {http_method}, Question ID: {question_id}")
        
        # Route based on action first (most reliable), then HTTP method
        
        # CREATE - action-based
        if action == 'create':
            return create_question(body)
        
        # UPDATE - action-based
        if action == 'update':
            return update_question(question_id, body)
        
        # DELETE - action-based
        if action == 'delete':
            return delete_question(question_id)
        
        # BULK IMPORT
        if action == 'bulk_import':
            return bulk_import_questions(body)
        
        # GET STATISTICS
        if action == 'statistics' or query_params.get('statistics'):
            return get_statistics()
        
        # GET BY TOPIC (user-facing)
        if action == 'by_topic' or query_params.get('topic_filter'):
            topic = body.get('topic') or query_params.get('topic')
            status = body.get('status') or query_params.get('status', 'published')
            return get_questions_by_topic(topic, status)
        
        # UPDATE STATUS
        if action == 'update_status':
            new_status = body.get('status')
            return update_status(question_id, new_status)
        
        # GET SINGLE QUESTION
        if action == 'get' and question_id:
            return get_question(question_id)
        
        # Fallback to HTTP method-based routing
        
        # GET SINGLE QUESTION (HTTP method)
        if http_method == 'GET' and question_id:
            return get_question(question_id)
        
        # GET ALL QUESTIONS (with filters)
        if http_method == 'GET' or action == 'list' or not action:
            return get_questions(query_params)
        
        # CREATE (HTTP method fallback)
        if http_method == 'POST' and not action:
            return create_question(body)
        
        # UPDATE QUESTION (HTTP method fallback)
        if http_method == 'PUT':
            return update_question(question_id, body)
        
        # DELETE QUESTION (HTTP method fallback)
        if http_method == 'DELETE':
            return delete_question(question_id)
        
        return response(400, {
            "success": False,
            "error": {
                "code": "INVALID_REQUEST",
                "message": f"Invalid request. Action: {action}, Method: {http_method}"
            }
        })
            
    except json.JSONDecodeError:
        return response(400, {
            "success": False,
            "error": {
                "code": "INVALID_JSON",
                "message": "Invalid JSON in request body"
            }
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An error occurred processing your request"
            }
        })


"""
========================================
AWS SETUP INSTRUCTIONS
========================================

1. Create DynamoDB Table:
   
   Table Name: CodingQuestions
   Partition Key: questionId (String)
   
   Optional GSIs for better query performance:
   - GSI1: difficultyTopic-index
     Partition Key: difficultyTopic (String)
   - GSI2: statusDifficulty-index  
     Partition Key: statusDifficulty (String)
   - GSI3: topic-index
     Partition Key: topic (String)
     Sort Key: updatedAt (String)

2. Create Lambda Function:
   - Runtime: Python 3.9+
   - Handler: coding_questions_handler.lambda_handler
   - Memory: 256 MB
   - Timeout: 30 seconds

3. IAM Role Permissions:
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "dynamodb:GetItem",
                   "dynamodb:PutItem",
                   "dynamodb:UpdateItem",
                   "dynamodb:DeleteItem",
                   "dynamodb:Scan",
                   "dynamodb:Query",
                   "dynamodb:BatchWriteItem"
               ],
               "Resource": [
                   "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/CodingQuestions",
                   "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/CodingQuestions/index/*"
               ]
           },
           {
               "Effect": "Allow",
               "Action": [
                   "logs:CreateLogGroup",
                   "logs:CreateLogStream",
                   "logs:PutLogEvents"
               ],
               "Resource": "arn:aws:logs:*:*:*"
           }
       ]
   }

4. API Gateway Setup:
   
   REST API Routes:
   
   POST   /questions              - Create new question
   GET    /questions              - Get all questions (with filters)
   GET    /questions/{questionId} - Get single question
   PUT    /questions/{questionId} - Update question
   DELETE /questions/{questionId} - Delete question
   
   Query Parameters for GET /questions:
   - difficulty: Easy, Medium, Hard, or all
   - topic: topic name or all
   - status: draft, published, archived, or all
   - search: text search in title/description
   - limit: number of results (default 50)
   
   POST body actions:
   - action: "bulk_import" - Import multiple questions
   - action: "update_status" - Change question status
   - action: "statistics" - Get question statistics

5. Example API Calls:

   # Create a question
   POST /questions
   {
       "title": "Two Sum",
       "description": "Given an array of integers...",
       "difficulty": "Easy",
       "topic": "Arrays",
       "companies": ["google", "amazon"],
       "constraints": ["2 <= nums.length <= 10^4"],
       "inputFormat": "Array of integers and target",
       "outputFormat": "Array of two indices",
       "examples": [
           {
               "input": "nums = [2,7,11,15], target = 9",
               "output": "[0,1]",
               "explanation": "nums[0] + nums[1] = 9"
           }
       ],
       "hints": ["Use a hash map"],
       "testCases": [
           {
               "input": "[2,7,11,15]\\n9",
               "expectedOutput": "[0,1]",
               "isHidden": false
           }
       ],
       "starterCode": {
           "python": "def twoSum(nums, target):\\n    pass",
           "javascript": "function twoSum(nums, target) {\\n}"
       },
       "avgTime": 15,
       "status": "published"
   }

   # Get all published Medium questions on Arrays
   GET /questions?status=published&difficulty=Medium&topic=Arrays

   # Update question status
   POST /questions
   {
       "action": "update_status",
       "questionId": "abc-123",
       "status": "published"
   }

   # Bulk import
   POST /questions
   {
       "action": "bulk_import",
       "questions": [...]
   }

========================================
QUESTION SCHEMA
========================================

{
    "questionId": "uuid",           // Auto-generated
    "title": "string",              // Required
    "description": "string",        // Required, full problem statement
    "difficulty": "Easy|Medium|Hard",
    "topic": "string",              // Arrays, Trees, DP, etc.
    "companies": ["string"],        // Company IDs
    "constraints": ["string"],      // Problem constraints
    "inputFormat": "string",        // Input format description
    "outputFormat": "string",       // Output format description
    "examples": [
        {
            "input": "string",
            "output": "string",
            "explanation": "string"
        }
    ],
    "hints": ["string"],            // Hints for solving
    "testCases": [
        {
            "id": "string",
            "input": "string",
            "expectedOutput": "string",
            "isHidden": boolean,
            "explanation": "string"
        }
    ],
    "starterCode": {
        "python": "string",
        "javascript": "string",
        "java": "string",
        "cpp": "string",
        "typescript": "string"
    },
    "solution": "string",           // Optional solution code
    "avgTime": number,              // Average time in minutes
    "status": "draft|published|archived",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp",
    "createdBy": "string"           // Admin user ID
}

========================================
"""
