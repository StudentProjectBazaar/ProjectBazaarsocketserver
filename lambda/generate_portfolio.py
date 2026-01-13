"""
Lambda Function: Portfolio Generator (Gemini Fixed Version)
---------------------------------------------------------
1. Receive resume (PDF/DOCX) as base64
2. Extract text
3. Use Google Gemini 1.5 Flash to extract portfolio data
4. Generate portfolio with selectable templates
5. Deploy to Vercel
6. Return live URL
7. Save history to DynamoDB

Supported Actions:
- getTemplates: Returns list of available templates
- parseResume: Extracts portfolio data from resume (for preview)
- previewPortfolio: Generates HTML preview without deploying
- generatePortfolio: Full flow - extract, generate, deploy
- getPortfolioHistory: Get user's portfolio generation history
- deletePortfolio: Delete a portfolio from history
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
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from decimal import Decimal

# Import AWS SDK for DynamoDB
try:
    import boto3
    from boto3.dynamodb.conditions import Key
    dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'ap-south-2'))
    PORTFOLIO_TABLE = dynamodb.Table(os.environ.get('DYNAMODB_TABLE', 'portfolio-history'))
    DYNAMODB_ENABLED = True
except ImportError:
    DYNAMODB_ENABLED = False
    PORTFOLIO_TABLE = None

# Import templates module
try:
    from portfolio_templates import TEMPLATES, get_template_list, generate_portfolio_html
except ImportError:
    # Fallback for local testing
    TEMPLATES = {}
    def get_template_list(): return []
    def generate_portfolio_html(data, template_id="modern"): return "<html><body>Template not found</body></html>"

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
        
        action = body.get("action", "")
        print(f"Received request: action={action}")

        # Route to appropriate handler based on action
        if action == "getTemplates":
            return handle_get_templates(headers)
        
        elif action == "parseResume":
            return handle_parse_resume(body, headers)
        
        elif action == "previewPortfolio":
            return handle_preview_portfolio(body, headers)
        
        elif action == "generatePortfolio":
            return handle_generate_portfolio(body, headers)
        
        elif action == "getPortfolioHistory":
            return handle_get_portfolio_history(body, headers)
        
        elif action == "deletePortfolio":
            return handle_delete_portfolio(body, headers)
        
        else:
            return error_response(f"Invalid action: {action}. Valid actions: getTemplates, parseResume, previewPortfolio, generatePortfolio, getPortfolioHistory, deletePortfolio", headers)

    except Exception as e:
        print("Lambda error:", e)
        import traceback
        traceback.print_exc()
        return error_response(str(e), headers)


# =========================
# ACTION HANDLERS
# =========================
def handle_get_templates(headers: Dict[str, str]) -> Dict[str, Any]:
    """Return list of available portfolio templates."""
    templates = get_template_list()
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "success": True,
            "templates": templates
        })
    }


def handle_parse_resume(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Parse resume and extract portfolio data without generating HTML."""
    user_email = body.get("userEmail", "")
    file_name = body.get("fileName", "resume.pdf")
    file_type = body.get("fileType", "application/pdf")
    file_b64 = body.get("fileContent")

    if not file_b64:
        return error_response("No resume provided", headers)

    file_bytes = base64.b64decode(file_b64)
    resume_text = extract_text_from_resume(file_bytes, file_type, file_name)
    
    # Check if extraction failed (returned raw PDF marker)
    is_raw_pdf = resume_text.startswith("[PDF_RAW_BASE64:")
    
    if not is_raw_pdf and len(resume_text) < 50:
        return error_response("Resume extraction failed - could not read text from document", headers)

    portfolio_data = extract_portfolio_data_with_ai(resume_text, user_email)
    
    # Prepare extracted text for response (don't send raw base64 back)
    extracted_text = ""
    if is_raw_pdf:
        extracted_text = "[PDF processed directly by AI - text extraction was not possible]"
    else:
        # Return first 5000 chars of extracted text for user to review
        extracted_text = resume_text[:5000]
        if len(resume_text) > 5000:
            extracted_text += f"\n\n... [truncated, {len(resume_text)} total characters extracted]"

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "success": True,
            "portfolioData": portfolio_data,
            "extractedText": extracted_text,
            "extractionMethod": "multimodal_ai" if is_raw_pdf else "text_extraction",
            "textLength": len(resume_text) if not is_raw_pdf else 0
        })
    }


def handle_preview_portfolio(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Generate HTML preview for a specific template without deploying."""
    portfolio_data = body.get("portfolioData")
    template_id = body.get("templateId", "modern")
    
    if not portfolio_data:
        return error_response("No portfolio data provided", headers)
    
    # Validate template exists
    if template_id not in TEMPLATES and TEMPLATES:
        return error_response(f"Invalid template: {template_id}", headers)
    
    # Generate HTML
    html_content = generate_portfolio_html(portfolio_data, template_id)
    
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "success": True,
            "html": html_content,
            "templateId": template_id
        })
    }


def handle_generate_portfolio(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Full portfolio generation: parse resume, generate HTML, deploy to Vercel."""
    user_id = body.get("userId", f"user_{int(datetime.now().timestamp())}")
    user_email = body.get("userEmail", "")
    file_name = body.get("fileName", "resume.pdf")
    file_type = body.get("fileType", "application/pdf")
    file_b64 = body.get("fileContent")
    template_id = body.get("templateId", "modern")
    
    # Can also accept pre-parsed portfolio data
    portfolio_data = body.get("portfolioData")
    extracted_text = ""
    extraction_method = "pre_parsed"

    if not portfolio_data:
        # Need to parse resume first
        if not file_b64:
            return error_response("No resume or portfolio data provided", headers)

        file_bytes = base64.b64decode(file_b64)
        resume_text = extract_text_from_resume(file_bytes, file_type, file_name)
        
        # Check if extraction failed (returned raw PDF marker)
        is_raw_pdf = resume_text.startswith("[PDF_RAW_BASE64:")
        
        if not is_raw_pdf and len(resume_text) < 50:
            return error_response("Resume extraction failed", headers)

        portfolio_data = extract_portfolio_data_with_ai(resume_text, user_email)
        
        # Prepare extracted text for response
        if is_raw_pdf:
            extracted_text = "[PDF processed directly by AI - text extraction was not possible]"
            extraction_method = "multimodal_ai"
        else:
            extracted_text = resume_text[:5000]
            if len(resume_text) > 5000:
                extracted_text += f"\n\n... [truncated, {len(resume_text)} total characters extracted]"
            extraction_method = "text_extraction"

    # Deploy with selected template
    deployment = deploy_to_vercel(portfolio_data, user_id, template_id)
    
    if not deployment.get("success"):
        return error_response(deployment.get("error"), headers)

    # Save to DynamoDB history
    portfolio_id = str(uuid.uuid4())
    history_record = save_portfolio_to_history(
        portfolio_id=portfolio_id,
        user_id=user_id,
        user_email=user_email,
        portfolio_data=portfolio_data,
        template_id=template_id,
        live_url=deployment["liveUrl"],
        file_name=file_name
    )

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "success": True,
            "portfolioId": portfolio_id,
            "liveUrl": deployment["liveUrl"],
            "previewUrl": deployment["previewUrl"],
            "portfolioData": portfolio_data,
            "templateId": template_id,
            "extractedText": extracted_text,
            "extractionMethod": extraction_method
        })
    }


def handle_get_portfolio_history(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Get user's portfolio generation history."""
    user_id = body.get("userId")
    
    if not user_id:
        return error_response("User ID is required", headers)
    
    history = get_portfolio_history(user_id)
    
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "success": True,
            "history": history
        })
    }


def handle_delete_portfolio(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Delete a portfolio from history."""
    user_id = body.get("userId")
    portfolio_id = body.get("portfolioId")
    
    if not user_id or not portfolio_id:
        return error_response("User ID and Portfolio ID are required", headers)
    
    success = delete_portfolio_from_history(user_id, portfolio_id)
    
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "success": success,
            "message": "Portfolio deleted successfully" if success else "Failed to delete portfolio"
        })
    }

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
# DATABASE FUNCTIONS
# =========================
def save_portfolio_to_history(
    portfolio_id: str,
    user_id: str,
    user_email: str,
    portfolio_data: Dict[str, Any],
    template_id: str,
    live_url: str,
    file_name: str
) -> Optional[Dict[str, Any]]:
    """Save portfolio generation to DynamoDB history."""
    if not DYNAMODB_ENABLED or not PORTFOLIO_TABLE:
        print("DynamoDB not enabled, skipping history save")
        return None
    
    try:
        # Get name from portfolio data
        name = portfolio_data.get("personal", {}).get("name", "Untitled Portfolio")
        title = portfolio_data.get("personal", {}).get("title", "")
        
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        item = {
            "userId": user_id,
            "portfolioId": portfolio_id,
            "userEmail": user_email,
            "name": name,
            "title": title,
            "templateId": template_id,
            "liveUrl": live_url,
            "fileName": file_name,
            "createdAt": timestamp,
            "updatedAt": timestamp,
            # Store a summary, not full data to save space
            "summary": {
                "skillCount": sum(len(v) for v in portfolio_data.get("skills", {}).values()),
                "experienceCount": len(portfolio_data.get("experience", [])),
                "projectCount": len(portfolio_data.get("projects", [])),
                "educationCount": len(portfolio_data.get("education", []))
            }
        }
        
        PORTFOLIO_TABLE.put_item(Item=item)
        print(f"Saved portfolio {portfolio_id} for user {user_id}")
        return item
        
    except Exception as e:
        print(f"Error saving to DynamoDB: {e}")
        return None


def get_portfolio_history(user_id: str) -> List[Dict[str, Any]]:
    """Get all portfolios for a user from DynamoDB."""
    if not DYNAMODB_ENABLED or not PORTFOLIO_TABLE:
        print("DynamoDB not enabled, returning empty history")
        return []
    
    try:
        response = PORTFOLIO_TABLE.query(
            KeyConditionExpression=Key('userId').eq(user_id),
            ScanIndexForward=False  # Sort by newest first
        )
        
        items = response.get('Items', [])
        
        # Convert Decimal types to int/float for JSON serialization
        def convert_decimals(obj):
            if isinstance(obj, Decimal):
                return int(obj) if obj % 1 == 0 else float(obj)
            elif isinstance(obj, dict):
                return {k: convert_decimals(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_decimals(i) for i in obj]
            return obj
        
        return [convert_decimals(item) for item in items]
        
    except Exception as e:
        print(f"Error querying DynamoDB: {e}")
        return []


def delete_portfolio_from_history(user_id: str, portfolio_id: str) -> bool:
    """Delete a portfolio from DynamoDB history."""
    if not DYNAMODB_ENABLED or not PORTFOLIO_TABLE:
        print("DynamoDB not enabled, cannot delete")
        return False
    
    try:
        PORTFOLIO_TABLE.delete_item(
            Key={
                'userId': user_id,
                'portfolioId': portfolio_id
            }
        )
        print(f"Deleted portfolio {portfolio_id} for user {user_id}")
        return True
        
    except Exception as e:
        print(f"Error deleting from DynamoDB: {e}")
        return False


# =========================
# RESUME EXTRACTION (Smart Pipeline)
# =========================
def extract_text_from_resume(content: bytes, file_type: str, file_name: str) -> str:
    """
    Extract text from resume files (PDF/DOCX).
    Uses smart extraction with pdfplumber + OCR fallback for PDFs.
    Falls back to Gemini multimodal if extraction fails.
    """
    temp_dir = tempfile.mkdtemp()
    path = os.path.join(temp_dir, file_name)

    try:
        # Save file to temp directory
        with open(path, "wb") as f:
            f.write(content)

        if file_name.lower().endswith(".pdf"):
            # Use smart PDF extraction
            text = extract_pdf_text_smart(path)
            
            # Check if extraction produced garbage or failed
            if is_garbage_text(text):
                print("PDF extraction produced unreadable text, using raw content for Gemini multimodal")
                return f"[PDF_RAW_BASE64:{base64.b64encode(content).decode()}]"
            
            print(f"PDF extraction successful: {len(text)} characters")
            return text
            
        if file_name.lower().endswith((".docx", ".doc")):
            return extract_docx_text(path)

        return content.decode("utf-8", errors="ignore")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def extract_pdf_text_smart(pdf_path: str) -> str:
    """
    Smart PDF text extraction with 3-step strategy:
    1. PyPDF2 (most compatible) - works in Lambda without extra dependencies
    2. pdfplumber (more accurate) - if available
    3. OCR fallback (pytesseract) - for scanned/image-based PDFs
    """
    
    # Step 1: Try PyPDF2 first (most compatible with Lambda)
    try:
        import PyPDF2
        
        print("Attempting PDF extraction with PyPDF2...")
        all_text = []
        
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        all_text.append(page_text)
                except Exception as e:
                    print(f"PyPDF2 error on page {page_num + 1}: {e}")
                    continue
        
        combined_text = "\n\n".join(all_text)
        cleaned_text = clean_resume_text(combined_text)
        
        if len(cleaned_text) > 200:
            print(f"PyPDF2 extraction successful: {len(cleaned_text)} chars")
            return cleaned_text
        else:
            print(f"PyPDF2 extracted only {len(cleaned_text)} chars, trying pdfplumber...")
            
    except ImportError:
        print("PyPDF2 not available, trying pdfplumber...")
    except Exception as e:
        print(f"PyPDF2 failed: {e}, trying pdfplumber...")
    
    # Step 2: Try pdfplumber (more accurate for complex layouts)
    try:
        import pdfplumber
        
        print("Attempting PDF extraction with pdfplumber...")
        all_text = []
        
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                try:
                    # Extract with layout preservation
                    page_text = page.extract_text(
                        x_tolerance=2,
                        y_tolerance=2,
                        layout=True
                    )
                    if page_text:
                        all_text.append(page_text)
                except Exception as e:
                    print(f"pdfplumber error on page {page_num + 1}: {e}")
                    continue
        
        combined_text = "\n\n".join(all_text)
        cleaned_text = clean_resume_text(combined_text)
        
        # If we got substantial text, return it
        if len(cleaned_text) > 300:
            print(f"pdfplumber extraction successful: {len(cleaned_text)} chars")
            return cleaned_text
        else:
            print(f"pdfplumber extracted only {len(cleaned_text)} chars, trying OCR...")
            
    except ImportError:
        print("pdfplumber not available, trying OCR...")
    except Exception as e:
        print(f"pdfplumber failed: {e}, trying OCR...")
    
    # Step 3: OCR fallback for scanned/image-based PDFs
    try:
        from pdf2image import convert_from_path
        import pytesseract
        
        print("Attempting PDF extraction with OCR (pytesseract)...")
        
        # Convert PDF pages to images
        images = convert_from_path(pdf_path, dpi=300)
        
        all_text = []
        for i, img in enumerate(images):
            try:
                # OCR with optimized settings for resume text
                page_text = pytesseract.image_to_string(
                    img,
                    lang="eng",
                    config="--psm 6"  # Assume uniform block of text
                )
                if page_text:
                    all_text.append(page_text)
            except Exception as e:
                print(f"OCR error on page {i + 1}: {e}")
                continue
        
        combined_text = "\n\n".join(all_text)
        cleaned_text = clean_resume_text(combined_text)
        
        print(f"OCR extraction complete: {len(cleaned_text)} chars")
        return cleaned_text
        
    except ImportError as e:
        print(f"OCR dependencies not available: {e}")
    except Exception as e:
        print(f"OCR extraction failed: {e}")
    
    # If all methods fail, return empty string (will trigger multimodal fallback)
    print("All PDF extraction methods failed")
    return ""


def clean_resume_text(text: str) -> str:
    """
    Clean and normalize extracted resume text.
    Removes artifacts and fixes common extraction issues.
    """
    if not text:
        return ""
    
    # Remove FontAwesome / CID artifacts like (cid:123)
    text = re.sub(r'\(cid:\d+\)', '', text)
    text = re.sub(r'cid:\d+', '', text)
    
    # Remove other common PDF artifacts
    text = re.sub(r'\uf0[0-9a-fA-F]{2}', '', text)  # Unicode private use area
    text = re.sub(r'[\ue000-\uf8ff]', '', text)  # Private use area characters
    
    # Normalize various bullet point styles to simple dash
    bullet_patterns = ['•', '●', '○', '▪', '▫', '►', '▸', '◆', '◇', '■', '□', '★', '☆', '➤', '➢', '→', '»']
    for bullet in bullet_patterns:
        text = text.replace(bullet, '-')
    
    # Fix broken email addresses (user @ gmail . com -> user@gmail.com)
    text = re.sub(r'(\w+)\s*@\s*(\w+)\s*\.\s*(\w+)', r'\1@\2.\3', text)
    
    # Fix broken URLs
    text = re.sub(r'(https?)\s*:\s*/\s*/\s*', r'\1://', text)
    
    # Fix broken phone numbers with excessive spaces
    text = re.sub(r'(\+?\d)\s+(\d)\s+(\d)\s+(\d)', r'\1\2\3\4', text)
    
    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Collapse multiple newlines to max 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Collapse multiple spaces to single space
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Remove lines that are just whitespace
    lines = [line.strip() for line in text.split('\n')]
    lines = [line for line in lines if line]
    
    # Rejoin with newlines
    text = '\n'.join(lines)
    
    # Remove any remaining non-printable characters except newlines/tabs
    text = ''.join(c for c in text if c.isprintable() or c in '\n\t')
    
    return text.strip()


def is_garbage_text(text: str) -> bool:
    """Check if extracted text is garbage/unreadable."""
    if not text or len(text) < 50:
        return True
    
    # Check for CID artifacts (common in failed PDF extraction)
    cid_count = len(re.findall(r'\(cid:\d+\)', text)) + len(re.findall(r'cid:\d+', text))
    if cid_count > 10:
        print(f"Found {cid_count} CID artifacts - likely garbage")
        return True
    
    # Count readable ASCII characters (letters, numbers, common punctuation)
    readable = sum(1 for c in text if c.isalnum() or c in ' .,;:!?@#$%&*()-_+=\n\t\'"/:')
    ratio = readable / len(text) if text else 0
    
    # If less than 60% readable characters, it's likely garbage
    if ratio < 0.6:
        print(f"Readable ratio {ratio:.2f} < 0.6 - likely garbage")
        return True
    
    # Check for common words that should appear in a resume
    common_words = [
        'experience', 'education', 'skills', 'work', 'project', 'email', 
        'phone', 'address', 'university', 'degree', 'company', 'developer',
        'engineer', 'manager', 'bachelor', 'master', 'year', 'resume', 'cv',
        'summary', 'objective', 'professional', 'technical', 'software',
        'programming', 'languages', 'certifications', 'achievements'
    ]
    text_lower = text.lower()
    found_words = sum(1 for word in common_words if word in text_lower)
    
    # If very few common resume words found, likely garbage
    if found_words < 2:
        print(f"Found only {found_words} common resume words - likely garbage")
        return True
    
    return False


def extract_docx_text(path: str) -> str:
    """Extract text from DOCX files."""
    try:
        with zipfile.ZipFile(path) as z:
            xml = z.read("word/document.xml").decode("utf-8")
        text = re.sub("<[^<]+?>", " ", xml)
        text = re.sub(r"\s+", " ", text)
        return clean_resume_text(text)
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

# =========================
# GEMINI AI (FIXED)
# =========================
# List of Gemini models to try in order (for fallback support)
GEMINI_MODELS = [
    "gemini-2.0-flash",           # Latest stable
    "gemini-1.5-flash",           # Previous stable
    "gemini-1.5-flash-latest",    # Latest 1.5 flash
    "gemini-pro",                 # Fallback
]


def extract_portfolio_data_with_ai(resume_text: str, user_email: str) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        print("No GEMINI_API_KEY configured, using fallback")
        return get_fallback_portfolio_data(resume_text, user_email)

    # Check if we received raw PDF content (extraction failed)
    is_raw_pdf = resume_text.startswith("[PDF_RAW_BASE64:")
    
    prompt = f"""You are an expert at extracting structured data from resumes.
Extract all portfolio data from this resume document.
Return ONLY valid JSON with no additional text or explanation.

IMPORTANT: Extract the ACTUAL name, title, skills, experience from the document.
Do NOT use placeholder or generic values.

Required JSON Schema:
{{
  "personal": {{ 
    "name": "Full Name from resume", 
    "title": "Job title/role from resume", 
    "tagline": "A catchy one-liner about the person", 
    "email": "{user_email or 'email from resume'}", 
    "location": "City/Country from resume", 
    "bio": "2-3 sentence professional summary" 
  }},
  "about": {{ 
    "headline": "About section headline", 
    "description": "Detailed professional description", 
    "highlights": ["highlight1", "highlight2", "highlight3"] 
  }},
  "education": [
    {{"institution": "University Name", "degree": "Degree Name", "field": "Field of Study", "year": "Year"}}
  ],
  "experience": [
    {{"company": "Company Name", "title": "Job Title", "period": "Start - End", "description": "Job description"}}
  ],
  "projects": [
    {{"name": "Project Name", "description": "Project description", "technologies": ["tech1", "tech2"]}}
  ],
  "skills": {{
    "frontend": [{{"name": "React", "level": 85}}],
    "backend": [{{"name": "Node.js", "level": 80}}],
    "database": [{{"name": "PostgreSQL", "level": 75}}],
    "devops": [{{"name": "AWS", "level": 70}}],
    "other": [{{"name": "Problem Solving", "level": 90}}]
  }},
  "certifications": [
    {{"name": "Certification Name", "issuer": "Issuing Organization", "year": "Year"}}
  ],
  "links": {{ 
    "github": "github URL if found", 
    "linkedin": "linkedin URL if found", 
    "twitter": "", 
    "email": "mailto:email@example.com" 
  }}
}}
"""

    # Build the content parts
    parts = []
    
    if is_raw_pdf:
        # Use multimodal: send PDF directly to Gemini
        pdf_base64 = resume_text.replace("[PDF_RAW_BASE64:", "").rstrip("]")
        parts.append({
            "inline_data": {
                "mime_type": "application/pdf",
                "data": pdf_base64
            }
        })
        parts.append({"text": prompt})
        print("Using multimodal PDF processing with Gemini")
    else:
        # Send as text
        full_prompt = prompt + f"\n\nResume Content:\n{resume_text[:12000]}"
        parts.append({"text": full_prompt})

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": parts
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 4096
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
        ]
    }

    # Try each model in order until one works
    last_error = None
    for model_name in GEMINI_MODELS:
        try:
            # Try v1 API first (stable), then v1beta if needed
            for api_version in ["v1", "v1beta"]:
                url = (
                    f"https://generativelanguage.googleapis.com/{api_version}/models/"
                    f"{model_name}:generateContent"
                    f"?key={GEMINI_API_KEY}"
                )
                
                print(f"Trying Gemini model: {model_name} (API: {api_version})")

                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )

                try:
                    with urllib.request.urlopen(req, timeout=90) as r:
                        res = json.loads(r.read().decode("utf-8"))

                    text = res["candidates"][0]["content"]["parts"][0]["text"]
                    # Clean up JSON from markdown code blocks
                    text = re.sub(r"```json\s*", "", text)
                    text = re.sub(r"```\s*", "", text)
                    text = text.strip()
                    
                    # Find JSON object in the response
                    json_match = re.search(r'\{[\s\S]*\}', text)
                    if json_match:
                        text = json_match.group(0)

                    result = json.loads(text)
                    print(f"Successfully extracted portfolio using {model_name} ({api_version})")
                    print(f"Portfolio name: {result.get('personal', {}).get('name', 'Unknown')}")
                    return result
                    
                except urllib.error.HTTPError as e:
                    if e.code == 404:
                        # Model not found, try next
                        print(f"Model {model_name} not found on {api_version}, trying next...")
                        continue
                    elif e.code == 400:
                        # Bad request - might be wrong API version, try next
                        error_body = e.read().decode() if e.fp else ""
                        print(f"Bad request for {model_name} ({api_version}): {error_body[:200]}")
                        continue
                    else:
                        raise
                        
        except Exception as e:
            last_error = e
            print(f"Error with model {model_name}: {e}")
            continue
    
    # All models failed
    print(f"All Gemini models failed. Last error: {last_error}")
    import traceback
    traceback.print_exc()
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
def deploy_to_vercel(portfolio_data: Dict[str, Any], user_id: str, template_id: str = "modern") -> Dict[str, Any]:
    if not VERCEL_TOKEN:
        return {
            "success": True,
            "liveUrl": f"https://portfolio-{user_id}.vercel.app",
            "previewUrl": f"https://portfolio-{user_id}.vercel.app"
        }

    try:
        # Sanitize user_id for valid project name (alphanumeric, hyphens, max 100 chars)
        safe_user_id = re.sub(r'[^a-zA-Z0-9-]', '-', user_id)[:50]
        
        # Generate portfolio HTML content using selected template
        html_content = generate_portfolio_html(portfolio_data, template_id)
        print(f"Generated portfolio with template: {template_id}")
        
        files = [{
            "file": "index.html",
            "data": base64.b64encode(html_content.encode()).decode(),
            "encoding": "base64"
        }]

        payload = {
            "name": f"portfolio-{safe_user_id}",
            "files": files,
            "target": "production",
            "projectSettings": {
                "framework": None
            }
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

    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        print(f"Vercel API error: {e.code} - {error_body}")
        return {"success": False, "error": f"Vercel deployment failed: {error_body or str(e)}"}
    except Exception as e:
        print(f"Deployment error: {e}")
        return {"success": False, "error": str(e)}
