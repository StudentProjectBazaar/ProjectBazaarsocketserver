import json
import uuid
from datetime import datetime
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

# ================= CONFIG =================
REGION = "ap-south-2"
PLACEMENT_PREP_TABLE = "PlacementPrep"

# ================= AWS =================
dynamodb = boto3.resource("dynamodb", region_name=REGION)
placement_table = dynamodb.Table(PLACEMENT_PREP_TABLE)

CONFIG_CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Max-Age": "3600",
}


# ================= HELPERS =================
def response(status: int, body, headers=None):
    """Create API Gateway response with CORS headers"""
    response_headers = {
        "Content-Type": "application/json",
        **CONFIG_CORS_HEADERS,
    }
    if headers:
        response_headers.update(headers)
    
    return {
        "statusCode": status,
        "headers": response_headers,
        "body": json.dumps(body, default=str) if body is not None else "",
    }


def now_iso() -> str:
    return datetime.utcnow().isoformat()


def parse_body(event):
    """Parse request body from event"""
    try:
        body = event.get("body", "{}") or "{}"
        if isinstance(body, str):
            return json.loads(body)
        return body
    except Exception as e:
        print(f"Error parsing body: {e}")
        return {}


def get_path_parameter(event, param_name):
    """Get path parameter from event"""
    path_params = event.get("pathParameters") or {}
    return path_params.get(param_name)


def get_query_parameter(event, param_name):
    """Get query parameter from event"""
    query_params = event.get("queryStringParameters") or {}
    if query_params:
        return query_params.get(param_name)
    return None


def normalize_topic_item(item_id: str, raw: dict, now: str) -> dict:
    """Normalize and validate placement topic item"""
    # Normalize resources
    resources = []
    for res in raw.get("resources", []):
        if isinstance(res, dict) and res.get("name") and res.get("url"):
            resources.append({
                "name": str(res.get("name", "")).strip(),
                "url": str(res.get("url", "")).strip(),
                "type": str(res.get("type", "")).strip(),
            })

    return {
        "id": item_id,
        "title": raw.get("title", "").strip(),
        "importance": raw.get("importance", "Important"),
        "timeNeeded": raw.get("timeNeeded", "").strip(),
        "resources": resources,
        "createdAt": raw.get("createdAt") or now,
        "updatedAt": now,
    }


# ================= CRUD OPERATIONS =================

def handle_get_all():
    """GET / - Get all placement topics"""
    try:
        result = placement_table.scan()
        items = result.get("Items", [])
        
        # Sort by importance (Critical > Important > Good to Know) then by title
        importance_order = {"Critical": 0, "Important": 1, "Good to Know": 2}
        items.sort(key=lambda x: (
            importance_order.get(x.get("importance", "Important"), 1),
            x.get("title", "")
        ))
        
        return response(200, {
            "success": True,
            "topics": items,
            "count": len(items)
        })
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', '')
        if error_code == 'ResourceNotFoundException':
            return response(200, {"success": True, "topics": [], "count": 0})
        return response(500, {
            "success": False,
            "message": "Failed to retrieve topics",
            "error": str(e)
        })
    except Exception as e:
        return response(500, {
            "success": False,
            "message": "Internal server error",
            "error": str(e)
        })


def handle_get_one(topic_id: str):
    """GET /{id} - Get single placement topic by ID"""
    if not topic_id:
        return response(400, {
            "success": False,
            "message": "Topic ID is required"
        })
    
    try:
        result = placement_table.get_item(Key={"id": topic_id})
        
        if "Item" in result:
            return response(200, {
                "success": True,
                "topic": result["Item"]
            })
        else:
            return response(404, {
                "success": False,
                "message": f"Topic with ID '{topic_id}' not found"
            })
    except ClientError as e:
        return response(500, {
            "success": False,
            "message": "Failed to retrieve topic",
            "error": str(e)
        })


def handle_post(body: dict):
    """POST / - Create new placement topic(s)"""
    # Check if it's a single topic or bulk operation
    if "topics" in body:
        # Bulk create/update (from admin UI)
        return handle_bulk_put(body.get("topics", []))
    elif "title" in body:
        # Single topic create
        return handle_create_one(body)
    else:
        return response(400, {
            "success": False,
            "message": "Invalid request body. Provide 'topics' array or single 'topic' object"
        })


def handle_create_one(topic_data: dict):
    """Create a single placement topic"""
    now = now_iso()
    topic_id = topic_data.get("id") or str(uuid.uuid4())
    
    try:
        normalized = normalize_topic_item(topic_id, topic_data, now)
        placement_table.put_item(Item=normalized)
        
        return response(201, {
            "success": True,
            "message": "Topic created successfully",
            "topic": normalized
        })
    except Exception as e:
        return response(500, {
            "success": False,
            "message": "Failed to create topic",
            "error": str(e)
        })


def handle_bulk_put(topics: list):
    """Bulk create/update topics (replaces entire list)"""
    if not isinstance(topics, list):
        return response(400, {
            "success": False,
            "message": "'topics' must be a list"
        })
    
    now = now_iso()
    
    # Get existing IDs to delete ones that are no longer present
    try:
        existing = placement_table.scan().get("Items", [])
        existing_ids = {item.get("id") for item in existing if item.get("id")}
    except Exception:
        existing_ids = set()
    
    incoming_ids = set()
    
    # Write all topics
    try:
        with placement_table.batch_writer() as batch:
            for raw in topics:
                if not isinstance(raw, dict):
                    continue
                
                item_id = raw.get("id") or str(uuid.uuid4())
                incoming_ids.add(item_id)
                
                normalized = normalize_topic_item(item_id, raw, now)
                batch.put_item(Item=normalized)
        
        # Delete entries that are no longer present
        to_delete = [item_id for item_id in existing_ids if item_id not in incoming_ids]
        if to_delete:
            with placement_table.batch_writer() as batch:
                for item_id in to_delete:
                    batch.delete_item(Key={"id": item_id})
        
        return response(200, {
            "success": True,
            "message": f"Updated {len(incoming_ids)} placement topics",
            "count": len(incoming_ids),
            "deleted": len(to_delete)
        })
    except Exception as e:
        return response(500, {
            "success": False,
            "message": "Failed to save topics",
            "error": str(e)
        })


def handle_put(topic_id: str, body: dict):
    """PUT /{id} - Update single placement topic"""
    if not topic_id:
        return response(400, {
            "success": False,
            "message": "Topic ID is required"
        })
    
    # Check if topic exists
    try:
        existing = placement_table.get_item(Key={"id": topic_id})
        if "Item" not in existing:
            return response(404, {
                "success": False,
                "message": f"Topic with ID '{topic_id}' not found"
            })
        
        # Preserve createdAt, update updatedAt
        now = now_iso()
        existing_item = existing["Item"]
        topic_data = {
            **body,
            "id": topic_id,
            "createdAt": existing_item.get("createdAt", now),
        }
        
        normalized = normalize_topic_item(topic_id, topic_data, now)
        placement_table.put_item(Item=normalized)
        
        return response(200, {
            "success": True,
            "message": "Topic updated successfully",
            "topic": normalized
        })
    except ClientError as e:
        return response(500, {
            "success": False,
            "message": "Failed to update topic",
            "error": str(e)
        })


def handle_delete(topic_id: str):
    """DELETE /{id} - Delete single placement topic"""
    if not topic_id:
        return response(400, {
            "success": False,
            "message": "Topic ID is required"
        })
    
    try:
        # Check if topic exists
        existing = placement_table.get_item(Key={"id": topic_id})
        if "Item" not in existing:
            return response(404, {
                "success": False,
                "message": f"Topic with ID '{topic_id}' not found"
            })
        
        placement_table.delete_item(Key={"id": topic_id})
        
        return response(200, {
            "success": True,
            "message": "Topic deleted successfully",
            "id": topic_id
        })
    except ClientError as e:
        return response(500, {
            "success": False,
            "message": "Failed to delete topic",
            "error": str(e)
        })


def handle_delete_by_body(body: dict):
    """DELETE via POST body (for compatibility)"""
    topic_id = body.get("id")
    if not topic_id:
        return response(400, {
            "success": False,
            "message": "Missing 'id' in request body"
        })
    return handle_delete(topic_id)


# ================= MAIN HANDLER =================
def lambda_handler(event, context):
    """
    Unified Lambda handler for Placement Prep CRUD operations.
    
    Supports:
    - GET /              -> List all topics
    - GET /{id}          -> Get single topic
    - POST /             -> Create topic(s) or bulk update
    - PUT /{id}          -> Update single topic
    - DELETE /{id}       -> Delete single topic
    - POST with action   -> Alternative method (for compatibility)
    
    Request Body Examples:
    
    POST / (single create):
    {
      "title": "Data Structures & Algorithms",
      "importance": "Critical",
      "timeNeeded": "3-4 months",
      "resources": [...]
    }
    
    POST / (bulk update):
    {
      "topics": [
        {
          "id": "uuid",
          "title": "...",
          ...
        }
      ]
    }
    
    PUT /{id}:
    {
      "title": "Updated Title",
      "importance": "Important",
      ...
    }
    """
    
    # Get HTTP method
    http_method = (
        event.get("httpMethod") or
        event.get("requestContext", {}).get("http", {}).get("method", "") or
        event.get("requestContext", {}).get("httpMethod", "")
    )
    
    # Handle CORS preflight
    if http_method == "OPTIONS":
        return {
            "statusCode": 204,
            "headers": CONFIG_CORS_HEADERS,
            "body": "",
        }
    
    # Parse request body
    body = parse_body(event)
    
    # Get path parameters
    topic_id = get_path_parameter(event, "id")
    
    # Handle different HTTP methods
    try:
        if http_method == "GET":
            if topic_id:
                return handle_get_one(topic_id)
            else:
                return handle_get_all()
        
        elif http_method == "POST":
            # Check if it's an action-based request (for compatibility)
            action = body.get("action")
            if action == "list":
                return handle_get_all()
            elif action == "put":
                return handle_bulk_put(body.get("topics", []))
            elif action == "delete":
                return handle_delete_by_body(body)
            else:
                return handle_post(body)
        
        elif http_method == "PUT":
            if not topic_id:
                return response(400, {
                    "success": False,
                    "message": "Topic ID is required in path for PUT request"
                })
            return handle_put(topic_id, body)
        
        elif http_method == "DELETE":
            if topic_id:
                return handle_delete(topic_id)
            else:
                return response(400, {
                    "success": False,
                    "message": "Topic ID is required in path for DELETE request"
                })
        
        else:
            return response(405, {
                "success": False,
                "message": f"Method {http_method} not allowed"
            })
    
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        import traceback
        traceback.print_exc()
        return response(500, {
            "success": False,
            "message": "Internal server error",
            "error": str(e)
        })
