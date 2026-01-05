import json
import uuid
import boto3
import traceback
from datetime import datetime
from decimal import Decimal
from botocore.config import Config

# ================= CONFIG =================
COURSES_TABLE = "Courses"
S3_BUCKET = "projectbazaar-admin-coursesandnotes"
REGION = "ap-south-2"

# ================= AWS =================
dynamodb = boto3.resource("dynamodb", region_name=REGION)
courses_table = dynamodb.Table(COURSES_TABLE)

s3 = boto3.client(
    "s3",
    region_name=REGION,
    config=Config(signature_version="s3v4")
)

# ================= HELPERS =================
def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Max-Age": "3600"
        },
        "body": json.dumps(body, default=str) if body else ""
    }

def now_iso():
    return datetime.utcnow().isoformat()

def to_decimal(value):
    return Decimal(str(value))

# ================= HANDLER =================
def lambda_handler(event, context):
    try:
        # ---------- CORS Preflight ----------
        http_method = event.get("httpMethod") or event.get('requestContext', {}).get('http', {}).get('method', '')
        if http_method == "OPTIONS":
            return {
                "statusCode": 204,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
                    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
                    "Access-Control-Max-Age": "3600"
                },
                "body": ""
            }

        body = json.loads(event.get("body", "{}"))

        # ======================================================
        # ACTION 1: GENERATE PRESIGNED URL (PDF / VIDEO / IMAGE)
        # ======================================================
        if body.get("action") == "getPresignedUrl":
            admin_id = body.get("adminId")
            file_name = body.get("fileName")
            course_id = body.get("courseId", str(uuid.uuid4()))

            if not admin_id or not file_name:
                return response(400, {
                    "success": False,
                    "message": "adminId and fileName are required"
                })

            s3_key = f"courses/{admin_id}/{course_id}/{uuid.uuid4()}-{file_name}"

            # Generate presigned URL WITHOUT ContentType parameter
            # This allows the client to upload without signature mismatch
            upload_url = s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": S3_BUCKET,
                    "Key": s3_key
                    # DO NOT include ContentType here - let S3 auto-detect
                },
                ExpiresIn=900  # 15 minutes
            )

            file_url = f"https://{S3_BUCKET}.s3.{REGION}.amazonaws.com/{s3_key}"

            return response(200, {
                "success": True,
                "uploadUrl": upload_url,
                "fileUrl": file_url,
                "courseId": course_id
            })

        # ======================================================
        # ACTION 2: CREATE COURSE (ALL DATA FROM FRONTEND)
        # ======================================================
        required_fields = ["adminId", "adminName", "title", "description", "category"]

        for field in required_fields:
            if not body.get(field):
                return response(400, {
                    "success": False,
                    "message": f"{field} is required"
                })

        course_id = str(uuid.uuid4())
        timestamp = now_iso()

        price = body.get("price", 0)

        course_item = {
            # ---------- IDENTIFIERS ----------
            "courseId": course_id,

            # ---------- BASIC DETAILS ----------
            "title": body.get("title"),
            "description": body.get("description"),
            "category": body.get("category"),
            "subCategory": body.get("subCategory"),
            "level": body.get("level", "Beginner"),
            "language": body.get("language", "English"),
            "tags": body.get("tags", []),

            # ---------- PRICING ----------
            "price": to_decimal(price),
            "currency": body.get("currency", "USD"),
            "isFree": price == 0,

            # ---------- MEDIA ----------
            "thumbnailUrl": body.get("thumbnailUrl"),
            "promoVideoUrl": body.get("promoVideoUrl"),

            # ---------- INSTRUCTOR ----------
            "instructor": {
                "adminId": body.get("adminId"),
                "name": body.get("adminName")
            },

            # ---------- COURSE CONTENT ----------
            "content": {
                "pdfs": body.get("pdfs", []),        # [{name, url}]
                "videos": body.get("videos", []),    # [{title, url}]
                "notes": body.get("notes", []),
                "additionalResources": body.get("resources", [])
            },

            # ---------- STATUS ----------
            "status": body.get("status", "draft"),
            "visibility": body.get("visibility", "public"),

            # ---------- ANALYTICS ----------
            "likesCount": 0,
            "purchasesCount": 0,
            "viewsCount": 0,

            # ---------- REVENUE ----------
            "totalRevenue": Decimal("0"),

            # ---------- RATINGS ----------
            "averageRating": Decimal("0"),
            "ratingsCount": 0,

            # ---------- TIMESTAMPS ----------
            "createdAt": timestamp,
            "updatedAt": timestamp,
            "publishedAt": timestamp if body.get("status") == "published" else None
        }

        # Remove null values
        course_item = {k: v for k, v in course_item.items() if v is not None}

        # Save to DynamoDB
        courses_table.put_item(Item=course_item)

        return response(201, {
            "success": True,
            "message": "Course created successfully",
            "courseId": course_id
        })

    except Exception as e:
        traceback.print_exc()
        return response(500, {
            "success": False,
            "message": "Internal server error",
            "error": str(e)
        })

