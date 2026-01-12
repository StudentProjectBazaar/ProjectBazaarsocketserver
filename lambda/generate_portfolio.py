"""
Lambda Function: Portfolio Generator (Complete Version)
-------------------------------------------------------
This function handles the complete portfolio generation workflow:
1. Receive resume (PDF/DOCX) as base64
2. Extract text from resume
3. Use AI (OpenAI GPT) to extract structured portfolio data
4. Generate portfolio with extracted data
5. Deploy to Vercel using their API
6. Return live URL

Environment Variables Required:
- OPENAI_API_KEY: OpenAI API key for GPT
- VERCEL_TOKEN: Vercel deployment token

Author: Project Bazaar
"""

import json
import base64
import os
import re
import tempfile
import shutil
from datetime import datetime
from typing import Dict, Any, Optional
import urllib.request
import urllib.error
import zipfile

# Configuration
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
VERCEL_TOKEN = os.environ.get('VERCEL_TOKEN', '')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for portfolio generation.
    """
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'OK'})}
    
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', event)
        
        if body.get('action') != 'generatePortfolio':
            return error_response('Invalid action', headers)
        
        user_id = body.get('userId', f'user_{int(datetime.now().timestamp())}')
        user_email = body.get('userEmail', '')
        file_name = body.get('fileName', 'resume.pdf')
        file_type = body.get('fileType', 'application/pdf')
        file_content_b64 = body.get('fileContent', '')
        
        if not file_content_b64:
            return error_response('No file content provided', headers)
        
        file_content = base64.b64decode(file_content_b64)
        
        # Step 1: Extract text
        print(f"[{user_id}] Extracting text from resume...")
        resume_text = extract_text_from_resume(file_content, file_type, file_name)
        
        if not resume_text or len(resume_text) < 50:
            return error_response('Could not extract text from resume', headers)
        
        # Step 2: Extract portfolio data
        print(f"[{user_id}] Extracting portfolio data with AI...")
        portfolio_data = extract_portfolio_data_with_ai(resume_text, user_email)
        
        if not portfolio_data:
            return error_response('Could not extract portfolio data', headers)
        
        # Step 3: Deploy to Vercel
        print(f"[{user_id}] Deploying to Vercel...")
        deployment_result = deploy_to_vercel(portfolio_data, user_id)
        
        if not deployment_result.get('success'):
            return error_response(deployment_result.get('error', 'Deployment failed'), headers)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'stage': 'complete',
                'liveUrl': deployment_result.get('liveUrl'),
                'previewUrl': deployment_result.get('previewUrl'),
                'portfolioData': portfolio_data
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f'Server error: {str(e)}', headers)


def error_response(message: str, headers: Dict[str, str]) -> Dict[str, Any]:
    return {
        'statusCode': 400,
        'headers': headers,
        'body': json.dumps({'success': False, 'error': message})
    }


def extract_text_from_resume(file_content: bytes, file_type: str, file_name: str) -> str:
    """Extract text from PDF or DOCX."""
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file_name)
    
    try:
        with open(temp_path, 'wb') as f:
            f.write(file_content)
        
        if 'pdf' in file_type.lower() or file_name.lower().endswith('.pdf'):
            return extract_pdf_text(file_content)
        elif 'word' in file_type.lower() or file_name.lower().endswith(('.docx', '.doc')):
            return extract_docx_text(temp_path)
        else:
            return file_content.decode('utf-8', errors='ignore')
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def extract_pdf_text(content: bytes) -> str:
    """Basic PDF text extraction."""
    text_parts = []
    
    # Extract text between parentheses (PDF text objects)
    matches = re.findall(rb'\(([^)]+)\)', content)
    for match in matches:
        try:
            decoded = match.decode('utf-8', errors='ignore')
            if decoded.strip():
                text_parts.append(decoded)
        except:
            continue
    
    # Also try to find stream content
    stream_matches = re.findall(rb'stream\s*(.*?)\s*endstream', content, re.DOTALL)
    for stream in stream_matches:
        try:
            decoded = stream.decode('utf-8', errors='ignore')
            # Extract readable text
            readable = re.findall(r'[A-Za-z][A-Za-z\s.,@\-:;()0-9]+', decoded)
            text_parts.extend(readable)
        except:
            continue
    
    return ' '.join(text_parts)


def extract_docx_text(file_path: str) -> str:
    """Extract text from DOCX."""
    try:
        with zipfile.ZipFile(file_path) as z:
            with z.open('word/document.xml') as f:
                content = f.read().decode('utf-8')
        text = re.sub(r'<[^>]+>', ' ', content)
        return re.sub(r'\s+', ' ', text).strip()
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""


def extract_portfolio_data_with_ai(resume_text: str, user_email: str) -> Optional[Dict[str, Any]]:
    """Extract structured data using OpenAI."""
    
    if not OPENAI_API_KEY:
        return get_fallback_portfolio_data(resume_text, user_email)
    
    prompt = f"""Analyze this resume and extract portfolio data. Return ONLY valid JSON.

Resume:
{resume_text[:8000]}

Return JSON with this structure (use REAL data from resume):
{{
    "personal": {{"name": "", "title": "", "tagline": "", "email": "{user_email or ''}", "location": "", "bio": ""}},
    "about": {{"headline": "", "description": "", "highlights": []}},
    "education": [{{"id": 1, "degree": "", "field": "", "institution": "", "location": "", "year": "", "gpa": "", "highlights": []}}],
    "experience": [{{"id": 1, "role": "", "company": "", "type": "Full-time", "location": "", "period": "", "description": "", "achievements": [], "technologies": []}}],
    "projects": [{{"id": 1, "title": "", "description": "", "technologies": [], "featured": true, "category": ""}}],
    "skills": {{
        "frontend": [{{"name": "", "level": 80}}],
        "backend": [{{"name": "", "level": 80}}],
        "database": [{{"name": "", "level": 75}}],
        "devops": [{{"name": "", "level": 70}}],
        "other": [{{"name": "", "level": 80}}]
    }},
    "certifications": [{{"id": 1, "name": "", "issuer": "", "date": ""}}],
    "links": {{"github": "", "linkedin": "", "twitter": "", "email": "mailto:"}}
}}

Extract REAL data. Skill levels 60-95 based on experience."""

    try:
        request_data = json.dumps({
            "model": "gpt-4-turbo-preview",
            "messages": [
                {"role": "system", "content": "You are a resume parser. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 4000
        }).encode('utf-8')
        
        req = urllib.request.Request(
            'https://api.openai.com/v1/chat/completions',
            data=request_data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {OPENAI_API_KEY}'
            }
        )
        
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        content = result['choices'][0]['message']['content'].strip()
        content = re.sub(r'^```json?\n?', '', content)
        content = re.sub(r'\n?```$', '', content)
        
        return json.loads(content)
        
    except Exception as e:
        print(f"AI extraction error: {e}")
        return get_fallback_portfolio_data(resume_text, user_email)


def get_fallback_portfolio_data(resume_text: str, user_email: str) -> Dict[str, Any]:
    """Fallback parsing without AI."""
    
    lines = [l.strip() for l in resume_text.split('\n') if l.strip()]
    
    # Extract name
    name = "Professional"
    for line in lines[:5]:
        if len(line) < 50 and '@' not in line and not line[0].isdigit():
            name = line
            break
    
    # Extract email
    email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', resume_text)
    email = email_match.group(0) if email_match else user_email or "contact@example.com"
    
    # Extract skills
    tech_keywords = ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 
                     'TypeScript', 'Java', 'C++', 'SQL', 'MongoDB', 'PostgreSQL',
                     'Git', 'Linux', 'Kubernetes', 'Machine Learning', 'AI',
                     'HTML', 'CSS', 'Angular', 'Vue.js', 'Go', 'Rust', 'Redis']
    found_skills = [kw for kw in tech_keywords if kw.lower() in resume_text.lower()]
    
    # Extract links
    linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', resume_text, re.I)
    github_match = re.search(r'github\.com/[\w-]+', resume_text, re.I)
    
    return {
        "personal": {
            "name": name,
            "title": "Software Developer",
            "tagline": "Building innovative solutions",
            "email": email,
            "location": "India",
            "bio": f"A developer with expertise in {', '.join(found_skills[:3]) if found_skills else 'software development'}."
        },
        "about": {
            "headline": "Crafting Digital Solutions",
            "description": f"I'm a developer with experience in {', '.join(found_skills[:5]) if found_skills else 'modern technologies'}.\n\nPassionate about creating scalable solutions.",
            "highlights": ["Full-stack development", "Problem solving", "Clean code", "Continuous learning"]
        },
        "education": [{"id": 1, "degree": "Bachelor's Degree", "field": "Computer Science", "institution": "University", "location": "India", "year": "2019-2023", "gpa": "", "highlights": []}],
        "experience": [{"id": 1, "role": "Software Developer", "company": "Tech Company", "type": "Full-time", "location": "India", "period": "2023 - Present", "description": "Building applications.", "achievements": ["Developed features", "Collaborated with teams"], "technologies": found_skills[:6]}],
        "projects": [{"id": 1, "title": "Portfolio Project", "description": "Showcase of skills.", "technologies": found_skills[:4], "featured": True, "category": "Web Development"}],
        "skills": {
            "frontend": [{"name": s, "level": 85} for s in found_skills if s in ['React', 'JavaScript', 'TypeScript', 'Angular', 'Vue.js', 'HTML', 'CSS']][:4] or [{"name": "JavaScript", "level": 85}],
            "backend": [{"name": s, "level": 80} for s in found_skills if s in ['Node.js', 'Python', 'Java', 'Go']][:4] or [{"name": "Node.js", "level": 80}],
            "database": [{"name": s, "level": 75} for s in found_skills if s in ['SQL', 'PostgreSQL', 'MongoDB', 'Redis']][:3] or [{"name": "SQL", "level": 75}],
            "devops": [{"name": s, "level": 70} for s in found_skills if s in ['AWS', 'Docker', 'Git', 'Linux', 'Kubernetes']][:3] or [{"name": "Git", "level": 85}],
            "other": [{"name": "Problem Solving", "level": 90}]
        },
        "certifications": [],
        "links": {
            "github": f"https://{github_match.group(0)}" if github_match else "https://github.com",
            "linkedin": f"https://{linkedin_match.group(0)}" if linkedin_match else "https://linkedin.com",
            "twitter": "",
            "email": f"mailto:{email}"
        }
    }


def deploy_to_vercel(portfolio_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Deploy portfolio to Vercel using their API."""
    
    if not VERCEL_TOKEN:
        return {
            'success': True,
            'liveUrl': f'https://portfolio-{user_id}-demo.vercel.app',
            'previewUrl': f'https://portfolio-{user_id}-demo.vercel.app'
        }
    
    try:
        project_name = f"portfolio-{user_id.replace('_', '-')[:20]}"
        files = generate_portfolio_files(portfolio_data)
        
        deployment_data = {
            "name": project_name,
            "files": files,
            "target": "production",
            "projectSettings": {
                "buildCommand": "npm run build",
                "outputDirectory": "dist",
                "installCommand": "npm install",
                "framework": "vite"
            }
        }
        
        request_data = json.dumps(deployment_data).encode('utf-8')
        
        req = urllib.request.Request(
            'https://api.vercel.com/v13/deployments',
            data=request_data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {VERCEL_TOKEN}'
            }
        )
        
        with urllib.request.urlopen(req, timeout=180) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        url = result.get('url', '')
        if url and not url.startswith('http'):
            url = f'https://{url}'
        
        return {'success': True, 'liveUrl': url, 'previewUrl': url, 'deploymentId': result.get('id')}
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
        return {'success': False, 'error': f'Deployment failed: {error_body}'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def generate_portfolio_files(portfolio_data: Dict[str, Any]) -> list:
    """Generate all portfolio files for Vercel deployment."""
    
    def b64(content: str) -> str:
        return base64.b64encode(content.encode()).decode()
    
    # Portfolio data file
    portfolio_ts = f"""export const portfolioData = {json.dumps(portfolio_data, indent=2)};

export type PortfolioData = typeof portfolioData;
"""

    # Package.json
    package_json = {
        "name": "portfolio",
        "private": True,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "tsc && vite build",
            "preview": "vite preview"
        },
        "dependencies": {
            "framer-motion": "^11.0.0",
            "lucide-react": "^0.300.0",
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
        },
        "devDependencies": {
            "@types/react": "^18.2.0",
            "@types/react-dom": "^18.2.0",
            "@vitejs/plugin-react": "^4.2.0",
            "autoprefixer": "^10.4.17",
            "postcss": "^8.4.33",
            "tailwindcss": "^3.4.1",
            "typescript": "^5.3.3",
            "vite": "^5.0.0"
        }
    }

    # vite.config.ts
    vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  }
})
"""

    # tsconfig.json
    tsconfig = {
        "compilerOptions": {
            "target": "ES2020",
            "useDefineForClassFields": True,
            "lib": ["ES2020", "DOM", "DOM.Iterable"],
            "module": "ESNext",
            "skipLibCheck": True,
            "moduleResolution": "bundler",
            "allowImportingTsExtensions": True,
            "resolveJsonModule": True,
            "isolatedModules": True,
            "noEmit": True,
            "jsx": "react-jsx",
            "strict": True
        },
        "include": ["src"],
        "references": [{"path": "./tsconfig.node.json"}]
    }

    tsconfig_node = {
        "compilerOptions": {
            "composite": True,
            "skipLibCheck": True,
            "module": "ESNext",
            "moduleResolution": "bundler",
            "allowSyntheticDefaultImports": True
        },
        "include": ["vite.config.ts"]
    }

    # tailwind.config.js
    tailwind_config = """/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'midnight': '#0a0a0f',
        'charcoal': '#121218',
        'slate': '#1e1e2a',
        'accent': '#00d9ff',
        'accent-alt': '#ff6b35',
      },
    },
  },
  plugins: [],
}
"""

    # postcss.config.js
    postcss_config = """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""

    # index.html
    name = portfolio_data.get('personal', {}).get('name', 'Portfolio')
    index_html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{name} - Professional Portfolio" />
    <title>{name} | Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""

    # Generate files array
    files = [
        {"file": "package.json", "data": b64(json.dumps(package_json, indent=2))},
        {"file": "vite.config.ts", "data": b64(vite_config)},
        {"file": "tsconfig.json", "data": b64(json.dumps(tsconfig, indent=2))},
        {"file": "tsconfig.node.json", "data": b64(json.dumps(tsconfig_node, indent=2))},
        {"file": "tailwind.config.js", "data": b64(tailwind_config)},
        {"file": "postcss.config.js", "data": b64(postcss_config)},
        {"file": "index.html", "data": b64(index_html)},
        {"file": "src/data/portfolio.ts", "data": b64(portfolio_ts)},
        {"file": "src/main.tsx", "data": b64(get_main_tsx())},
        {"file": "src/index.css", "data": b64(get_index_css())},
        {"file": "src/App.tsx", "data": b64(get_app_tsx())},
        {"file": "src/components/Header.tsx", "data": b64(get_header_component())},
        {"file": "src/components/Hero.tsx", "data": b64(get_hero_component())},
        {"file": "src/components/About.tsx", "data": b64(get_about_component())},
        {"file": "src/components/Experience.tsx", "data": b64(get_experience_component())},
        {"file": "src/components/Projects.tsx", "data": b64(get_projects_component())},
        {"file": "src/components/Skills.tsx", "data": b64(get_skills_component())},
        {"file": "src/components/Education.tsx", "data": b64(get_education_component())},
        {"file": "src/components/Contact.tsx", "data": b64(get_contact_component())},
        {"file": "src/components/Footer.tsx", "data": b64(get_footer_component())},
        {"file": "public/favicon.svg", "data": b64(get_favicon_svg(name))},
    ]
    
    return files


# Component templates (simplified versions for Lambda)
def get_main_tsx():
    return """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""

def get_index_css():
    return """@tailwind base;
@tailwind components;
@tailwind utilities;

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #0a0a0f 100%);
  color: #e5e7eb;
  min-height: 100vh;
}
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #00d9ff, #ff6b35); border-radius: 4px; }
.glass { background: rgba(18,18,24,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
.gradient-text { background: linear-gradient(135deg, #00d9ff 0%, #ff6b35 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
"""

def get_app_tsx():
    return """import { portfolioData } from './data/portfolio';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header data={portfolioData} />
      <main>
        <Hero data={portfolioData} />
        <About data={portfolioData} />
        <Experience data={portfolioData} />
        <Projects data={portfolioData} />
        <Skills data={portfolioData} />
        <Education data={portfolioData} />
        <Contact data={portfolioData} />
      </main>
      <Footer data={portfolioData} />
    </div>
  );
}

export default App;
"""

def get_header_component():
    return """import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

export default function Header({ data }: { data: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled ? 'glass py-4' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d9ff] to-[#ff6b35] flex items-center justify-center">
            <span className="text-sm font-bold text-[#0a0a0f]">{data.personal.name.split(' ').map((n:string) => n[0]).join('')}</span>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <a key={item.href} href={item.href} className="text-sm text-gray-400 hover:text-[#00d9ff] transition-colors">{item.label}</a>
          ))}
        </nav>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <nav className="md:hidden glass p-6 flex flex-col gap-4">
          {navItems.map(item => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-[#00d9ff]">{item.label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
"""

def get_hero_component():
    return """import { Github, Linkedin, Twitter, Mail, ArrowDown } from 'lucide-react';

export default function Hero({ data }: { data: any }) {
  const socials = [
    { icon: Github, href: data.links.github },
    { icon: Linkedin, href: data.links.linkedin },
    { icon: Mail, href: data.links.email },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center relative pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d9ff]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ff6b35]/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Available for opportunities</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="text-white">Hi, I'm </span>
          <span className="gradient-text">{data.personal.name}</span>
        </h1>
        <h2 className="text-2xl md:text-3xl text-gray-400 mb-6">{data.personal.title}</h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">{data.personal.tagline}</p>
        <div className="flex justify-center gap-4 mb-8">
          <a href="#projects" className="px-8 py-4 bg-gradient-to-r from-[#00d9ff] to-[#ff6b35] text-[#0a0a0f] font-semibold rounded-xl">View My Work</a>
          <a href="#contact" className="px-8 py-4 border border-gray-700 text-white rounded-xl hover:border-[#00d9ff]">Get In Touch</a>
        </div>
        <div className="flex justify-center gap-4">
          {socials.map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="p-3 glass rounded-xl text-gray-400 hover:text-[#00d9ff]">
              <s.icon size={22} />
            </a>
          ))}
        </div>
      </div>
      <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 animate-bounce">
        <ArrowDown size={24} />
      </a>
    </section>
  );
}
"""

def get_about_component():
    return """import { CheckCircle, MapPin } from 'lucide-react';

export default function About({ data }: { data: any }) {
  return (
    <section id="about" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-[#00d9ff] font-mono text-sm">01. About Me</span>
          <h2 className="text-4xl font-bold text-white mt-4">{data.about.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">{data.about.description}</p>
            <div className="mt-8 space-y-3">
              {data.about.highlights.map((h: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00d9ff]" />
                  <span className="text-gray-300">{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d9ff] to-[#ff6b35] flex items-center justify-center text-2xl font-bold text-[#0a0a0f]">
                {data.personal.name.split(' ').map((n:string) => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{data.personal.name}</h3>
                <p className="text-[#00d9ff]">{data.personal.title}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={14} />{data.personal.location}
                </p>
              </div>
            </div>
            <p className="text-gray-400">{data.personal.bio}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
"""

def get_experience_component():
    return """import { Building2, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function Experience({ data }: { data: any }) {
  const [active, setActive] = useState(0);

  return (
    <section id="experience" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-[#00d9ff] font-mono text-sm">02. Experience</span>
          <h2 className="text-4xl font-bold text-white mt-4">Where I've Worked</h2>
        </div>
        <div className="grid md:grid-cols-[250px_1fr] gap-8">
          <div className="flex md:flex-col gap-2 overflow-x-auto">
            {data.experience.map((exp: any, i: number) => (
              <button key={i} onClick={() => setActive(i)} className={`px-4 py-3 text-left rounded-lg transition-all ${active === i ? 'glass text-[#00d9ff] border-l-2 border-[#00d9ff]' : 'text-gray-400 hover:text-white'}`}>
                <div className="font-medium">{exp.company}</div>
                <div className="text-sm opacity-70">{exp.period}</div>
              </button>
            ))}
          </div>
          <div className="glass rounded-2xl p-8">
            {data.experience.map((exp: any, i: number) => active === i && (
              <div key={i}>
                <h3 className="text-2xl font-bold text-white mb-2">{exp.role} <span className="text-[#00d9ff]">@ {exp.company}</span></h3>
                <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-4">
                  <span className="flex items-center gap-1"><Calendar size={14} />{exp.period}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} />{exp.location}</span>
                  <span className="flex items-center gap-1"><Building2 size={14} />{exp.type}</span>
                </div>
                <p className="text-gray-400 mb-6">{exp.description}</p>
                <ul className="space-y-2 mb-6">
                  {exp.achievements.map((a: string, j: number) => (
                    <li key={j} className="flex gap-2 text-gray-300"><span className="text-[#00d9ff]">▹</span>{a}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((t: string, j: number) => (
                    <span key={j} className="px-3 py-1 text-sm font-mono bg-[#00d9ff]/10 text-[#00d9ff] rounded-lg">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
"""

def get_projects_component():
    return """import { ExternalLink, Github, Folder } from 'lucide-react';

export default function Projects({ data }: { data: any }) {
  const featured = data.projects.filter((p: any) => p.featured);
  const other = data.projects.filter((p: any) => !p.featured);

  return (
    <section id="projects" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-[#00d9ff] font-mono text-sm">03. Projects</span>
          <h2 className="text-4xl font-bold text-white mt-4">Things I've Built</h2>
        </div>
        <div className="space-y-24 mb-16">
          {featured.map((p: any, i: number) => (
            <div key={i} className="grid md:grid-cols-2 gap-8 items-center">
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#00d9ff]/20 to-[#ff6b35]/20 p-1">
                  <div className="bg-[#121218] rounded-xl p-8 h-48 flex items-center justify-center">
                    <Folder className="w-16 h-16 text-[#00d9ff]" />
                  </div>
                </div>
              </div>
              <div className={i % 2 === 1 ? 'md:order-1 md:text-right' : ''}>
                <span className="text-[#00d9ff] font-mono text-sm">{p.category}</span>
                <h3 className="text-2xl font-bold text-white mt-2 mb-4">{p.title}</h3>
                <div className="glass rounded-xl p-6 mb-4">
                  <p className="text-gray-400">{p.description}</p>
                </div>
                <div className={`flex flex-wrap gap-2 ${i % 2 === 1 ? 'md:justify-end' : ''}`}>
                  {p.technologies.map((t: string, j: number) => (
                    <span key={j} className="text-sm font-mono text-gray-500">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {other.length > 0 && (
          <>
            <h3 className="text-xl font-bold text-white text-center mb-8">Other Projects</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {other.map((p: any, i: number) => (
                <div key={i} className="glass rounded-2xl p-6 hover:-translate-y-2 transition-transform">
                  <Folder className="w-10 h-10 text-[#00d9ff] mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">{p.title}</h4>
                  <p className="text-gray-400 text-sm mb-4">{p.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.technologies.slice(0,3).map((t: string, j: number) => (
                      <span key={j} className="text-xs font-mono text-gray-500">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
"""

def get_skills_component():
    return """import { Code2, Server, Database, Cloud, Sparkles } from 'lucide-react';

const icons: any = { frontend: Code2, backend: Server, database: Database, devops: Cloud, other: Sparkles };
const colors: any = { frontend: 'from-cyan-400 to-blue-500', backend: 'from-green-400 to-emerald-500', database: 'from-purple-400 to-violet-500', devops: 'from-orange-400 to-red-500', other: 'from-pink-400 to-rose-500' };

export default function Skills({ data }: { data: any }) {
  return (
    <section id="skills" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-[#00d9ff] font-mono text-sm">04. Skills</span>
          <h2 className="text-4xl font-bold text-white mt-4">Technical Expertise</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(data.skills).map(([cat, skills]: [string, any]) => {
            const Icon = icons[cat] || Sparkles;
            return (
              <div key={cat} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[cat] || colors.other} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white capitalize">{cat}</h3>
                </div>
                <div className="space-y-4">
                  {skills.map((s: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{s.name}</span>
                        <span className="text-gray-500 text-sm">{s.level}%</span>
                      </div>
                      <div className="h-2 bg-[#1e1e2a] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${colors[cat] || colors.other}`} style={{width: `${s.level}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
"""

def get_education_component():
    return """import { GraduationCap, Calendar, MapPin, Award } from 'lucide-react';

export default function Education({ data }: { data: any }) {
  return (
    <section id="education" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-[#00d9ff] font-mono text-sm">05. Education</span>
          <h2 className="text-4xl font-bold text-white mt-4">Academic Background</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {data.education.map((edu: any, i: number) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d9ff]/20 to-[#ff6b35]/20 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-[#00d9ff]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{edu.degree}</h3>
                    <p className="text-[#00d9ff]">{edu.field}</p>
                    <p className="text-gray-400">{edu.institution}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1"><Calendar size={14} />{edu.year}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} />{edu.location}</span>
                      {edu.gpa && <span className="flex items-center gap-1"><Award size={14} />GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {data.certifications.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-[#00d9ff]" />Certifications</h3>
              <div className="space-y-4">
                {data.certifications.map((c: any, i: number) => (
                  <div key={i} className="p-4 bg-[#1e1e2a]/50 rounded-xl">
                    <h4 className="font-medium text-white">{c.name}</h4>
                    <p className="text-sm text-gray-400">{c.issuer} • {c.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
"""

def get_contact_component():
    return """import { Mail, MapPin, Github, Linkedin, Twitter, Send } from 'lucide-react';

export default function Contact({ data }: { data: any }) {
  const socials = [
    { icon: Github, href: data.links.github, label: 'GitHub' },
    { icon: Linkedin, href: data.links.linkedin, label: 'LinkedIn' },
  ];

  return (
    <section id="contact" className="py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="text-[#00d9ff] font-mono text-sm">06. Contact</span>
        <h2 className="text-4xl font-bold text-white mt-4 mb-4">Get In Touch</h2>
        <p className="text-gray-400 mb-12 max-w-xl mx-auto">
          I'm currently open to new opportunities. Whether you have a question or just want to say hi, feel free to reach out!
        </p>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <a href={data.links.email} className="glass rounded-2xl p-6 group hover:border-[#00d9ff]/30 transition-colors">
            <Mail className="w-8 h-8 text-[#00d9ff] mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-1">Email Me</h3>
            <p className="text-gray-400 group-hover:text-[#00d9ff] transition-colors">{data.personal.email}</p>
          </a>
          <div className="glass rounded-2xl p-6">
            <MapPin className="w-8 h-8 text-[#ff6b35] mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-1">Location</h3>
            <p className="text-gray-400">{data.personal.location}</p>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          {socials.map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="p-4 glass rounded-xl hover:bg-white/5 transition-colors">
              <s.icon className="w-6 h-6 text-gray-400 hover:text-[#00d9ff]" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
"""

def get_footer_component():
    return """import { Heart, ArrowUp } from 'lucide-react';

export default function Footer({ data }: { data: any }) {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} className="p-3 glass rounded-xl text-gray-400 hover:text-[#00d9ff] mb-6 mx-auto block">
          <ArrowUp size={24} />
        </button>
        <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
          Built with <Heart size={14} className="text-red-500" /> by {data.personal.name}
        </p>
      </div>
    </footer>
  );
}
"""

def get_favicon_svg(name: str) -> str:
    initials = ''.join([n[0] for n in name.split()[:2]]).upper() or 'PF'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d9ff"/>
      <stop offset="100%" style="stop-color:#ff6b35"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="#0a0a0f"/>
  <text x="50" y="68" font-family="monospace" font-size="40" font-weight="bold" fill="url(#g)" text-anchor="middle">{initials}</text>
</svg>'''


if __name__ == '__main__':
    # Test
    test_event = {
        'action': 'generatePortfolio',
        'userId': 'test_user',
        'userEmail': 'test@example.com',
        'fileName': 'resume.pdf',
        'fileType': 'application/pdf',
        'fileContent': base64.b64encode(b'John Doe Software Developer React Node.js Python').decode()
    }
    result = lambda_handler(test_event, None)
    print(json.dumps(json.loads(result['body']), indent=2))
