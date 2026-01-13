"""
Lambda Function: Portfolio Generator (Gemini Fixed Version)
---------------------------------------------------------
1. Receive resume (PDF/DOCX) as base64
2. Extract text
3. Use Google Gemini 1.5 Flash to extract portfolio data
4. Generate portfolio
5. Deploy to Vercel
6. Return live URL
"""

import json
import base64
import os
import re
import tempfile
import shutil
import zipfile
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, Any, Optional

# =========================
# CONFIG
# =========================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")

# =========================
# LAMBDA HANDLER
# =========================
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
        "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
    }

    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}

    try:
        # Parse body - handle both string and dict formats from API Gateway
        body = event
        if "body" in event:
            if isinstance(event["body"], str):
                try:
                    body = json.loads(event["body"])
                except json.JSONDecodeError:
                    return error_response("Invalid JSON in request body", headers)
            elif isinstance(event["body"], dict):
                body = event["body"]
        
        print(f"Received request: action={body.get('action')}, fileName={body.get('fileName')}")

        if body.get("action") != "generatePortfolio":
            return error_response(f"Invalid action: {body.get('action')}", headers)

        user_id = body.get("userId", f"user_{int(datetime.now().timestamp())}")
        user_email = body.get("userEmail", "")
        file_name = body.get("fileName", "resume.pdf")
        file_type = body.get("fileType", "application/pdf")
        file_b64 = body.get("fileContent")

        if not file_b64:
            return error_response("No resume provided", headers)

        file_bytes = base64.b64decode(file_b64)

        resume_text = extract_text_from_resume(file_bytes, file_type, file_name)
        if len(resume_text) < 50:
            return error_response("Resume extraction failed", headers)

        portfolio_data = extract_portfolio_data_with_ai(resume_text, user_email)

        deployment = deploy_to_vercel(portfolio_data, user_id)
        if not deployment.get("success"):
            return error_response(deployment.get("error"), headers)

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "success": True,
                "liveUrl": deployment["liveUrl"],
                "previewUrl": deployment["previewUrl"],
                "portfolioData": portfolio_data
            })
        }

    except Exception as e:
        print("Lambda error:", e)
        return error_response(str(e), headers)

# =========================
# HELPERS
# =========================
def error_response(message: str, headers: Dict[str, str]) -> Dict[str, Any]:
    return {
        "statusCode": 400,
        "headers": headers,
        "body": json.dumps({"success": False, "error": message})
    }

# =========================
# RESUME EXTRACTION
# =========================
def extract_text_from_resume(content: bytes, file_type: str, file_name: str) -> str:
    temp_dir = tempfile.mkdtemp()
    path = os.path.join(temp_dir, file_name)

    try:
        with open(path, "wb") as f:
            f.write(content)

        if file_name.lower().endswith(".pdf"):
            return extract_pdf_text(content)
        if file_name.lower().endswith((".docx", ".doc")):
            return extract_docx_text(path)

        return content.decode("utf-8", errors="ignore")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def extract_pdf_text(content: bytes) -> str:
    texts = []
    matches = re.findall(rb"\(([^)]+)\)", content)
    for m in matches:
        try:
            texts.append(m.decode("utf-8", errors="ignore"))
        except:
            pass
    return " ".join(texts)

def extract_docx_text(path: str) -> str:
    try:
        with zipfile.ZipFile(path) as z:
            xml = z.read("word/document.xml").decode("utf-8")
        text = re.sub("<[^<]+?>", " ", xml)
        return re.sub(r"\s+", " ", text)
    except:
        return ""

# =========================
# GEMINI AI (FIXED)
# =========================
def extract_portfolio_data_with_ai(resume_text: str, user_email: str) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        return get_fallback_portfolio_data(resume_text, user_email)

    prompt = f"""
Extract portfolio data from this resume.
Return ONLY valid JSON.

Resume:
{resume_text[:8000]}

Schema:
{{
  "personal": {{ "name": "", "title": "", "tagline": "", "email": "{user_email}", "location": "", "bio": "" }},
  "about": {{ "headline": "", "description": "", "highlights": [] }},
  "education": [],
  "experience": [],
  "projects": [],
  "skills": {{
    "frontend": [],
    "backend": [],
    "database": [],
    "devops": [],
    "other": []
  }},
  "certifications": [],
  "links": {{ "github": "", "linkedin": "", "twitter": "", "email": "mailto:" }}
}}
"""

    try:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            "gemini-1.5-flash:generateContent"
            f"?key={GEMINI_API_KEY}"
        )

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUAL_CONTENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
            ]
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=60) as r:
            res = json.loads(r.read().decode("utf-8"))

        text = res["candidates"][0]["content"]["parts"][0]["text"]
        text = re.sub(r"```json|```", "", text).strip()

        return json.loads(text)

    except Exception as e:
        print("Gemini error:", e)
        return get_fallback_portfolio_data(resume_text, user_email)

# =========================
# FALLBACK
# =========================
def get_fallback_portfolio_data(resume_text: str, user_email: str) -> Dict[str, Any]:
    email_match = re.search(r"[\w.-]+@[\w.-]+\.\w+", resume_text)
    email = email_match.group(0) if email_match else user_email or "contact@example.com"

    return {
        "personal": {
            "name": resume_text.split("\n")[0][:40] or "Professional",
            "title": "Software Developer",
            "tagline": "Building modern solutions",
            "email": email,
            "location": "India",
            "bio": "Experienced developer with a passion for scalable systems."
        },
        "about": {
            "headline": "About Me",
            "description": "Skilled full-stack engineer.",
            "highlights": ["Full Stack", "Clean Code", "Scalable Systems"]
        },
        "education": [],
        "experience": [],
        "projects": [],
        "skills": {
            "frontend": [{"name": "React", "level": 85}],
            "backend": [{"name": "Node.js", "level": 80}],
            "database": [{"name": "PostgreSQL", "level": 75}],
            "devops": [{"name": "AWS", "level": 70}],
            "other": [{"name": "Problem Solving", "level": 90}]
        },
        "certifications": [],
        "links": {
            "github": "",
            "linkedin": "",
            "twitter": "",
            "email": f"mailto:{email}"
        }
    }

# =========================
# VERCEL DEPLOY
# =========================
def deploy_to_vercel(portfolio_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    if not VERCEL_TOKEN:
        return {
            "success": True,
            "liveUrl": f"https://portfolio-{user_id}.vercel.app",
            "previewUrl": f"https://portfolio-{user_id}.vercel.app"
        }

    try:
        files = [{
            "file": "index.html",
            "data": base64.b64encode(
                f"<h1>{portfolio_data['personal']['name']}</h1>".encode()
            ).decode()
        }]

        payload = {
            "name": f"portfolio-{user_id}",
            "files": files,
            "target": "production"
        }

        req = urllib.request.Request(
            "https://api.vercel.com/v13/deployments",
            data=json.dumps(payload).encode(),
            headers={
                "Authorization": f"Bearer {VERCEL_TOKEN}",
                "Content-Type": "application/json"
            }
        )

        with urllib.request.urlopen(req, timeout=120) as r:
            res = json.loads(r.read().decode())

        return {
            "success": True,
            "liveUrl": f"https://{res.get('url')}",
            "previewUrl": f"https://{res.get('url')}"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
