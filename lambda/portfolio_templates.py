"""
Portfolio Templates
-------------------
5+ professional portfolio templates for the portfolio generator.
Each template has a unique style and layout.
"""

from typing import Dict, Any, List

# Template metadata for frontend display
TEMPLATES = {
    "minimal": {
        "id": "minimal",
        "name": "Minimal",
        "description": "Clean and simple with plenty of whitespace",
        "preview_color": "#ffffff",
        "accent_color": "#000000",
        "thumbnail": "📄"
    },
    "modern": {
        "id": "modern", 
        "name": "Modern Dark",
        "description": "Dark theme with purple gradients",
        "preview_color": "#0a0a0f",
        "accent_color": "#a78bfa",
        "thumbnail": "🌙"
    },
    "professional": {
        "id": "professional",
        "name": "Professional",
        "description": "Corporate blue theme, perfect for business",
        "preview_color": "#f8fafc",
        "accent_color": "#2563eb",
        "thumbnail": "💼"
    },
    "creative": {
        "id": "creative",
        "name": "Creative",
        "description": "Bold colors and unique asymmetric layout",
        "preview_color": "#fef3c7",
        "accent_color": "#f59e0b",
        "thumbnail": "🎨"
    },
    "developer": {
        "id": "developer",
        "name": "Developer",
        "description": "Terminal-inspired theme for tech professionals",
        "preview_color": "#1a1a2e",
        "accent_color": "#00ff88",
        "thumbnail": "💻"
    },
    "elegant": {
        "id": "elegant",
        "name": "Elegant",
        "description": "Sophisticated design with serif typography",
        "preview_color": "#1c1917",
        "accent_color": "#d4af37",
        "thumbnail": "✨"
    }
}


def get_template_list() -> List[Dict[str, Any]]:
    """Return list of available templates for frontend."""
    return list(TEMPLATES.values())


def generate_portfolio_html(data: Dict[str, Any], template_id: str = "modern") -> str:
    """Generate portfolio HTML using the specified template."""
    template_func = TEMPLATE_GENERATORS.get(template_id, generate_modern_template)
    return template_func(data)


def extract_common_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract and normalize common data from portfolio data."""
    personal = data.get("personal", {})
    about = data.get("about", {})
    skills = data.get("skills", {})
    experience = data.get("experience", [])
    education = data.get("education", [])
    projects = data.get("projects", [])
    links = data.get("links", {})
    certifications = data.get("certifications", [])
    
    return {
        "name": personal.get("name", "Your Name"),
        "title": personal.get("title", "Professional"),
        "tagline": personal.get("tagline", ""),
        "bio": personal.get("bio", about.get("description", "")),
        "email": personal.get("email", ""),
        "location": personal.get("location", ""),
        "about_headline": about.get("headline", "About Me"),
        "about_description": about.get("description", ""),
        "highlights": about.get("highlights", []),
        "skills": skills,
        "experience": experience[:6],
        "education": education[:4],
        "projects": projects[:6],
        "certifications": certifications[:5],
        "github": links.get("github", ""),
        "linkedin": links.get("linkedin", ""),
        "twitter": links.get("twitter", ""),
    }


# =============================================================================
# TEMPLATE 1: MINIMAL
# =============================================================================
def generate_minimal_template(data: Dict[str, Any]) -> str:
    d = extract_common_data(data)
    
    skills_html = ""
    for category, skill_list in d["skills"].items():
        if skill_list:
            skills_html += f'<div class="skill-group"><span class="skill-label">{category}:</span> '
            skill_names = [s.get("name", s) if isinstance(s, dict) else s for s in skill_list]
            skills_html += ', '.join(skill_names) + '</div>'
    
    exp_html = ""
    for exp in d["experience"]:
        exp_html += f'''<div class="timeline-item">
            <div class="timeline-header">
                <strong>{exp.get("title", exp.get("role", ""))}</strong>
                <span class="timeline-date">{exp.get("period", "")}</span>
            </div>
            <div class="timeline-company">{exp.get("company", "")}</div>
            <p>{exp.get("description", "")}</p>
        </div>'''
    
    edu_html = ""
    for edu in d["education"]:
        edu_html += f'''<div class="edu-item">
            <strong>{edu.get("degree", "")}</strong>
            <span>{edu.get("institution", edu.get("school", ""))} • {edu.get("year", "")}</span>
        </div>'''
    
    proj_html = ""
    for proj in d["projects"]:
        proj_html += f'''<div class="project">
            <strong>{proj.get("name", proj.get("title", ""))}</strong>
            <p>{proj.get("description", "")}</p>
        </div>'''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{d["name"]} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Inter', -apple-system, sans-serif; 
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.7;
            font-size: 16px;
        }}
        .container {{ max-width: 720px; margin: 0 auto; padding: 80px 24px; }}
        header {{ margin-bottom: 64px; }}
        h1 {{ font-size: 2.5rem; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 8px; }}
        .subtitle {{ font-size: 1.1rem; color: #666; margin-bottom: 16px; }}
        .bio {{ color: #444; font-size: 1rem; max-width: 560px; }}
        section {{ margin-bottom: 56px; }}
        h2 {{ 
            font-size: 0.75rem; 
            font-weight: 500; 
            text-transform: uppercase; 
            letter-spacing: 0.1em;
            color: #999;
            margin-bottom: 24px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
        }}
        .skill-group {{ margin-bottom: 8px; color: #333; }}
        .skill-label {{ color: #666; text-transform: capitalize; }}
        .timeline-item {{ margin-bottom: 32px; }}
        .timeline-header {{ display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; }}
        .timeline-date {{ font-size: 0.85rem; color: #999; }}
        .timeline-company {{ color: #666; font-size: 0.9rem; margin: 4px 0 8px; }}
        .timeline-item p {{ color: #555; font-size: 0.95rem; }}
        .edu-item {{ margin-bottom: 16px; }}
        .edu-item span {{ display: block; color: #666; font-size: 0.9rem; }}
        .project {{ margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #f0f0f0; }}
        .project:last-child {{ border-bottom: none; }}
        .project p {{ color: #555; font-size: 0.95rem; margin-top: 8px; }}
        .contact {{ display: flex; gap: 24px; flex-wrap: wrap; }}
        .contact a {{ color: #1a1a1a; text-decoration: none; border-bottom: 1px solid #ccc; }}
        .contact a:hover {{ border-color: #1a1a1a; }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{d["name"]}</h1>
            <p class="subtitle">{d["title"]}{f' • {d["location"]}' if d["location"] else ''}</p>
            <p class="bio">{d["bio"]}</p>
        </header>
        
        {f'<section><h2>Skills</h2>{skills_html}</section>' if skills_html else ''}
        {f'<section><h2>Experience</h2>{exp_html}</section>' if exp_html else ''}
        {f'<section><h2>Projects</h2>{proj_html}</section>' if proj_html else ''}
        {f'<section><h2>Education</h2>{edu_html}</section>' if edu_html else ''}
        
        <section>
            <h2>Contact</h2>
            <div class="contact">
                {f'<a href="mailto:{d["email"]}">{d["email"]}</a>' if d["email"] else ''}
                {f'<a href="{d["github"]}" target="_blank">GitHub</a>' if d["github"] else ''}
                {f'<a href="{d["linkedin"]}" target="_blank">LinkedIn</a>' if d["linkedin"] else ''}
            </div>
        </section>
    </div>
</body>
</html>'''


# =============================================================================
# TEMPLATE 2: MODERN DARK
# =============================================================================
def generate_modern_template(data: Dict[str, Any]) -> str:
    d = extract_common_data(data)
    
    skills_html = ""
    for category, skill_list in d["skills"].items():
        if skill_list:
            skills_html += f'<div class="skill-category"><h4>{category.title()}</h4><div class="skill-tags">'
            for skill in skill_list:
                skill_name = skill.get("name", skill) if isinstance(skill, dict) else skill
                skills_html += f'<span class="skill-tag">{skill_name}</span>'
            skills_html += '</div></div>'
    
    exp_html = ""
    for exp in d["experience"]:
        exp_html += f'''<div class="exp-item">
            <h4>{exp.get("title", exp.get("role", ""))}</h4>
            <p class="company">{exp.get("company", "")} • {exp.get("period", "")}</p>
            <p>{exp.get("description", "")}</p>
        </div>'''
    
    proj_html = ""
    for proj in d["projects"]:
        techs = proj.get("technologies", [])
        tech_html = ''.join(f'<span class="tech">{t}</span>' for t in techs[:4]) if techs else ''
        proj_html += f'''<div class="project-card">
            <h4>{proj.get("name", proj.get("title", ""))}</h4>
            <p>{proj.get("description", "")}</p>
            <div class="techs">{tech_html}</div>
        </div>'''
    
    edu_html = ""
    for edu in d["education"]:
        edu_html += f'''<div class="edu-item">
            <h4>{edu.get("degree", "")}</h4>
            <p>{edu.get("institution", edu.get("school", ""))} • {edu.get("year", "")}</p>
        </div>'''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{d["name"]} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Inter', sans-serif; 
            background: linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%);
            color: #fff; 
            min-height: 100vh;
            line-height: 1.6;
        }}
        .container {{ max-width: 900px; margin: 0 auto; padding: 60px 24px; }}
        .hero {{ text-align: center; margin-bottom: 60px; }}
        .hero h1 {{ 
            font-size: 3rem; 
            font-weight: 700; 
            background: linear-gradient(135deg, #a78bfa, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 12px;
        }}
        .hero .title {{ font-size: 1.25rem; color: #9ca3af; margin-bottom: 8px; }}
        .hero .tagline {{ color: #6b7280; max-width: 600px; margin: 0 auto; }}
        .section {{ margin-bottom: 48px; }}
        .section h3 {{ 
            font-size: 1.5rem; 
            margin-bottom: 24px; 
            color: #a78bfa;
            border-bottom: 1px solid #374151;
            padding-bottom: 8px;
        }}
        .bio {{ color: #d1d5db; font-size: 1.1rem; }}
        .skill-category {{ margin-bottom: 20px; }}
        .skill-category h4 {{ color: #9ca3af; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }}
        .skill-tags {{ display: flex; flex-wrap: wrap; gap: 8px; }}
        .skill-tag {{ 
            background: rgba(167, 139, 250, 0.1); 
            border: 1px solid rgba(167, 139, 250, 0.3);
            color: #c4b5fd; 
            padding: 6px 14px; 
            border-radius: 20px; 
            font-size: 0.85rem;
        }}
        .exp-item, .edu-item {{ 
            background: rgba(255,255,255,0.03); 
            border: 1px solid rgba(255,255,255,0.05);
            padding: 20px; 
            border-radius: 12px; 
            margin-bottom: 16px; 
        }}
        .exp-item h4, .edu-item h4 {{ color: #f3f4f6; margin-bottom: 4px; }}
        .company {{ color: #a78bfa; font-size: 0.9rem; margin-bottom: 8px; }}
        .exp-item p, .edu-item p {{ color: #9ca3af; }}
        .project-card {{ 
            background: rgba(167, 139, 250, 0.05);
            border: 1px solid rgba(167, 139, 250, 0.1);
            padding: 20px; 
            border-radius: 12px; 
            margin-bottom: 16px;
        }}
        .project-card h4 {{ color: #c4b5fd; margin-bottom: 8px; }}
        .project-card p {{ color: #9ca3af; font-size: 0.95rem; margin-bottom: 12px; }}
        .techs {{ display: flex; gap: 6px; flex-wrap: wrap; }}
        .tech {{ font-size: 0.75rem; padding: 3px 8px; background: rgba(139, 92, 246, 0.2); border-radius: 4px; color: #c4b5fd; }}
        .contact {{ text-align: center; padding: 40px; background: rgba(167, 139, 250, 0.05); border-radius: 16px; }}
        .contact h3 {{ margin-bottom: 16px; }}
        .contact a {{ color: #a78bfa; text-decoration: none; font-size: 1.1rem; }}
        .contact a:hover {{ text-decoration: underline; }}
        .links {{ display: flex; gap: 20px; justify-content: center; margin-top: 16px; }}
        .links a {{ color: #9ca3af; transition: color 0.2s; }}
        .links a:hover {{ color: #a78bfa; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>{d["name"]}</h1>
            <p class="title">{d["title"]}</p>
            <p class="tagline">{d["tagline"]}</p>
        </div>
        
        <div class="section">
            <h3>About</h3>
            <p class="bio">{d["bio"]}</p>
        </div>
        
        {f'<div class="section"><h3>Skills</h3>{skills_html}</div>' if skills_html else ''}
        {f'<div class="section"><h3>Experience</h3>{exp_html}</div>' if exp_html else ''}
        {f'<div class="section"><h3>Projects</h3>{proj_html}</div>' if proj_html else ''}
        {f'<div class="section"><h3>Education</h3>{edu_html}</div>' if edu_html else ''}
        
        <div class="section contact">
            <h3>Get in Touch</h3>
            {f'<a href="mailto:{d["email"]}">{d["email"]}</a>' if d["email"] else ''}
            <div class="links">
                {f'<a href="{d["github"]}" target="_blank">GitHub</a>' if d["github"] else ''}
                {f'<a href="{d["linkedin"]}" target="_blank">LinkedIn</a>' if d["linkedin"] else ''}
            </div>
        </div>
    </div>
</body>
</html>'''


# =============================================================================
# TEMPLATE 3: PROFESSIONAL
# =============================================================================
def generate_professional_template(data: Dict[str, Any]) -> str:
    d = extract_common_data(data)
    
    skills_html = ""
    all_skills = []
    for category, skill_list in d["skills"].items():
        for skill in skill_list:
            skill_name = skill.get("name", skill) if isinstance(skill, dict) else skill
            level = skill.get("level", 80) if isinstance(skill, dict) else 80
            all_skills.append((skill_name, level))
    
    for skill_name, level in all_skills[:12]:
        skills_html += f'''<div class="skill-bar">
            <div class="skill-info"><span>{skill_name}</span><span>{level}%</span></div>
            <div class="bar"><div class="fill" style="width: {level}%"></div></div>
        </div>'''
    
    exp_html = ""
    for exp in d["experience"]:
        exp_html += f'''<div class="exp-card">
            <div class="exp-header">
                <div>
                    <h4>{exp.get("title", exp.get("role", ""))}</h4>
                    <p class="company">{exp.get("company", "")}</p>
                </div>
                <span class="period">{exp.get("period", "")}</span>
            </div>
            <p class="desc">{exp.get("description", "")}</p>
        </div>'''
    
    edu_html = ""
    for edu in d["education"]:
        edu_html += f'''<div class="edu-card">
            <h4>{edu.get("degree", "")}</h4>
            <p>{edu.get("institution", edu.get("school", ""))}</p>
            <span class="year">{edu.get("year", "")}</span>
        </div>'''
    
    proj_html = ""
    for proj in d["projects"]:
        proj_html += f'''<div class="proj-card">
            <h4>{proj.get("name", proj.get("title", ""))}</h4>
            <p>{proj.get("description", "")}</p>
        </div>'''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{d["name"]} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Source Sans Pro', sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }}
        .header {{ background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 60px 24px; text-align: center; }}
        .header h1 {{ font-size: 2.5rem; font-weight: 700; margin-bottom: 8px; }}
        .header .title {{ font-size: 1.2rem; opacity: 0.9; margin-bottom: 16px; }}
        .header .contact-bar {{ display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; font-size: 0.9rem; opacity: 0.85; }}
        .header .contact-bar a {{ color: white; text-decoration: none; }}
        .container {{ max-width: 1000px; margin: 0 auto; padding: 48px 24px; }}
        .grid {{ display: grid; grid-template-columns: 1fr 2fr; gap: 48px; }}
        @media (max-width: 768px) {{ .grid {{ grid-template-columns: 1fr; }} }}
        .sidebar h3, .main h3 {{ font-size: 1.1rem; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }}
        .bio {{ color: #475569; margin-bottom: 32px; }}
        .skill-bar {{ margin-bottom: 16px; }}
        .skill-info {{ display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px; }}
        .bar {{ height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }}
        .fill {{ height: 100%; background: linear-gradient(90deg, #1e40af, #3b82f6); border-radius: 4px; }}
        .exp-card {{ background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }}
        .exp-header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }}
        .exp-header h4 {{ color: #1e293b; font-size: 1.1rem; }}
        .company {{ color: #2563eb; font-size: 0.9rem; }}
        .period {{ color: #64748b; font-size: 0.85rem; white-space: nowrap; }}
        .desc {{ color: #64748b; font-size: 0.95rem; }}
        .edu-card {{ background: white; border-left: 3px solid #2563eb; padding: 16px; margin-bottom: 12px; }}
        .edu-card h4 {{ color: #1e293b; }}
        .edu-card p {{ color: #64748b; font-size: 0.9rem; }}
        .year {{ color: #2563eb; font-size: 0.85rem; font-weight: 600; }}
        .proj-card {{ background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px; }}
        .proj-card h4 {{ color: #1e40af; margin-bottom: 8px; }}
        .proj-card p {{ color: #64748b; font-size: 0.95rem; }}
        .section {{ margin-bottom: 40px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{d["name"]}</h1>
        <p class="title">{d["title"]}</p>
        <div class="contact-bar">
            {f'<a href="mailto:{d["email"]}">{d["email"]}</a>' if d["email"] else ''}
            {f'<span>{d["location"]}</span>' if d["location"] else ''}
            {f'<a href="{d["linkedin"]}" target="_blank">LinkedIn</a>' if d["linkedin"] else ''}
            {f'<a href="{d["github"]}" target="_blank">GitHub</a>' if d["github"] else ''}
        </div>
    </div>
    <div class="container">
        <div class="grid">
            <div class="sidebar">
                <div class="section">
                    <h3>About</h3>
                    <p class="bio">{d["bio"]}</p>
                </div>
                {f'<div class="section"><h3>Skills</h3>{skills_html}</div>' if skills_html else ''}
                {f'<div class="section"><h3>Education</h3>{edu_html}</div>' if edu_html else ''}
            </div>
            <div class="main">
                {f'<div class="section"><h3>Experience</h3>{exp_html}</div>' if exp_html else ''}
                {f'<div class="section"><h3>Projects</h3>{proj_html}</div>' if proj_html else ''}
            </div>
        </div>
    </div>
</body>
</html>'''


# =============================================================================
# TEMPLATE 4: CREATIVE
# =============================================================================
def generate_creative_template(data: Dict[str, Any]) -> str:
    d = extract_common_data(data)
    
    skills_html = ""
    for category, skill_list in d["skills"].items():
        if skill_list:
            for skill in skill_list[:3]:
                skill_name = skill.get("name", skill) if isinstance(skill, dict) else skill
                skills_html += f'<span class="skill-bubble">{skill_name}</span>'
    
    exp_html = ""
    for i, exp in enumerate(d["experience"]):
        exp_html += f'''<div class="exp-block" style="--delay: {i * 0.1}s">
            <div class="exp-year">{exp.get("period", "").split("-")[0].strip() if "-" in exp.get("period", "") else exp.get("period", "")}</div>
            <div class="exp-content">
                <h4>{exp.get("title", exp.get("role", ""))}</h4>
                <p class="exp-company">{exp.get("company", "")}</p>
                <p>{exp.get("description", "")}</p>
            </div>
        </div>'''
    
    proj_html = ""
    colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899']
    for i, proj in enumerate(d["projects"]):
        color = colors[i % len(colors)]
        proj_html += f'''<div class="proj-tile" style="--accent: {color}">
            <h4>{proj.get("name", proj.get("title", ""))}</h4>
            <p>{proj.get("description", "")[:100]}...</p>
        </div>'''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{d["name"]} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Space Grotesk', sans-serif; background: #fffbeb; color: #1c1917; line-height: 1.6; overflow-x: hidden; }}
        .hero {{ min-height: 80vh; display: flex; align-items: center; justify-content: center; position: relative; padding: 40px; }}
        .hero-bg {{ position: absolute; top: -50%; right: -20%; width: 800px; height: 800px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 50%; opacity: 0.3; z-index: 0; }}
        .hero-content {{ position: relative; z-index: 1; max-width: 800px; }}
        .hero h1 {{ font-size: 4rem; font-weight: 700; line-height: 1.1; margin-bottom: 16px; }}
        .hero h1 span {{ color: #f59e0b; }}
        .hero .subtitle {{ font-size: 1.5rem; color: #78716c; margin-bottom: 24px; }}
        .hero .bio {{ font-size: 1.1rem; color: #57534e; max-width: 600px; }}
        .skills-float {{ display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }}
        .skill-bubble {{ 
            background: #1c1917; 
            color: #fef3c7; 
            padding: 10px 20px; 
            border-radius: 50px;
            font-weight: 500;
            transform: rotate(var(--rot, 0deg));
        }}
        .skill-bubble:nth-child(odd) {{ --rot: -2deg; }}
        .skill-bubble:nth-child(even) {{ --rot: 2deg; }}
        .section {{ padding: 80px 40px; max-width: 1200px; margin: 0 auto; }}
        .section-title {{ font-size: 2.5rem; font-weight: 700; margin-bottom: 48px; position: relative; display: inline-block; }}
        .section-title::after {{ content: ''; position: absolute; bottom: -8px; left: 0; width: 60px; height: 4px; background: #f59e0b; }}
        .exp-block {{ display: flex; gap: 32px; margin-bottom: 40px; opacity: 0; animation: fadeIn 0.5s ease forwards; animation-delay: var(--delay); }}
        @keyframes fadeIn {{ to {{ opacity: 1; }} }}
        .exp-year {{ font-size: 1.5rem; font-weight: 700; color: #f59e0b; min-width: 80px; }}
        .exp-content h4 {{ font-size: 1.3rem; margin-bottom: 4px; }}
        .exp-company {{ color: #78716c; margin-bottom: 8px; }}
        .exp-content p {{ color: #57534e; }}
        .projects-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }}
        .proj-tile {{ 
            background: white; 
            padding: 32px; 
            border-radius: 16px; 
            border-left: 4px solid var(--accent);
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: transform 0.3s;
        }}
        .proj-tile:hover {{ transform: translateY(-4px); }}
        .proj-tile h4 {{ color: var(--accent); margin-bottom: 12px; font-size: 1.2rem; }}
        .proj-tile p {{ color: #57534e; font-size: 0.95rem; }}
        .contact-section {{ background: #1c1917; color: #fef3c7; padding: 80px 40px; text-align: center; }}
        .contact-section h2 {{ font-size: 2.5rem; margin-bottom: 24px; }}
        .contact-section a {{ color: #f59e0b; text-decoration: none; font-size: 1.2rem; }}
        .contact-links {{ display: flex; gap: 32px; justify-content: center; margin-top: 24px; }}
        .contact-links a {{ color: #a8a29e; transition: color 0.2s; }}
        .contact-links a:hover {{ color: #f59e0b; }}
    </style>
</head>
<body>
    <div class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
            <h1>Hi, I'm <span>{d["name"].split()[0] if d["name"] else "Creative"}</span></h1>
            <p class="subtitle">{d["title"]}</p>
            <p class="bio">{d["bio"]}</p>
            <div class="skills-float">{skills_html}</div>
        </div>
    </div>
    
    {f'<div class="section"><h2 class="section-title">Experience</h2>{exp_html}</div>' if exp_html else ''}
    {f'<div class="section"><h2 class="section-title">Projects</h2><div class="projects-grid">{proj_html}</div></div>' if proj_html else ''}
    
    <div class="contact-section">
        <h2>Let's Connect</h2>
        {f'<a href="mailto:{d["email"]}">{d["email"]}</a>' if d["email"] else ''}
        <div class="contact-links">
            {f'<a href="{d["github"]}" target="_blank">GitHub</a>' if d["github"] else ''}
            {f'<a href="{d["linkedin"]}" target="_blank">LinkedIn</a>' if d["linkedin"] else ''}
        </div>
    </div>
</body>
</html>'''


# =============================================================================
# TEMPLATE 5: DEVELOPER
# =============================================================================
def generate_developer_template(data: Dict[str, Any]) -> str:
    d = extract_common_data(data)
    
    skills_html = ""
    for category, skill_list in d["skills"].items():
        if skill_list:
            skill_names = [s.get("name", s) if isinstance(s, dict) else s for s in skill_list]
            joined_skills = '</span><span class="string">, </span><span class="string">'.join(skill_names)
            skills_html += f'<div class="code-line"><span class="keyword">const</span> {category} = [<span class="string">"{joined_skills}"</span>];</div>'
    
    exp_html = ""
    for exp in d["experience"]:
        exp_html += f'''<div class="terminal-block">
<span class="prompt">$</span> cat experience/{exp.get("company", "company").lower().replace(" ", "_")}.md
<div class="output">
# {exp.get("title", exp.get("role", ""))}
**{exp.get("company", "")}** | {exp.get("period", "")}

{exp.get("description", "")}
</div></div>'''
    
    proj_html = ""
    for proj in d["projects"]:
        techs = proj.get("technologies", [])
        tech_str = " ".join(f"#{t.lower().replace(' ', '')}" for t in techs[:3]) if techs else ""
        proj_html += f'''<div class="repo-card">
            <div class="repo-name">📁 {proj.get("name", proj.get("title", ""))}</div>
            <p class="repo-desc">{proj.get("description", "")}</p>
            <div class="repo-tags">{tech_str}</div>
        </div>'''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{d["name"]} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Inter', sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.6; }}
        code, .mono {{ font-family: 'JetBrains Mono', monospace; }}
        .container {{ max-width: 900px; margin: 0 auto; padding: 48px 24px; }}
        .header {{ border-bottom: 1px solid #21262d; padding-bottom: 32px; margin-bottom: 48px; }}
        .avatar {{ width: 120px; height: 120px; background: linear-gradient(135deg, #238636, #00ff88); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 24px; }}
        h1 {{ font-size: 2rem; color: #f0f6fc; margin-bottom: 8px; }}
        .username {{ color: #00ff88; font-family: 'JetBrains Mono', monospace; margin-bottom: 16px; }}
        .bio {{ color: #8b949e; max-width: 600px; }}
        .stats {{ display: flex; gap: 24px; margin-top: 20px; }}
        .stat {{ color: #8b949e; }}
        .stat strong {{ color: #f0f6fc; }}
        .section {{ margin-bottom: 48px; }}
        .section-header {{ display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: #f0f6fc; font-weight: 600; }}
        .code-block {{ background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; overflow-x: auto; }}
        .code-line {{ margin-bottom: 8px; }}
        .keyword {{ color: #ff7b72; }}
        .string {{ color: #a5d6ff; }}
        .terminal-block {{ background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 16px; margin-bottom: 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }}
        .prompt {{ color: #00ff88; }}
        .output {{ margin-top: 12px; padding-top: 12px; border-top: 1px solid #21262d; color: #8b949e; white-space: pre-wrap; }}
        .output strong {{ color: #f0f6fc; }}
        .repo-card {{ background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 20px; margin-bottom: 12px; }}
        .repo-name {{ color: #58a6ff; font-weight: 600; margin-bottom: 8px; }}
        .repo-desc {{ color: #8b949e; font-size: 0.9rem; margin-bottom: 12px; }}
        .repo-tags {{ color: #00ff88; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }}
        .contact-block {{ background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 24px; }}
        .contact-block a {{ color: #58a6ff; text-decoration: none; display: block; margin-bottom: 8px; }}
        .contact-block a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="avatar">👨‍💻</div>
            <h1>{d["name"]}</h1>
            <p class="username">@{d["name"].lower().replace(" ", "_") if d["name"] else "developer"}</p>
            <p class="bio">{d["bio"]}</p>
            <div class="stats">
                <span class="stat"><strong>{len(d["projects"])}</strong> projects</span>
                <span class="stat"><strong>{len(d["experience"])}</strong> positions</span>
                <span class="stat">📍 {d["location"] or "Earth"}</span>
            </div>
        </div>
        
        {f'<div class="section"><div class="section-header">💻 Tech Stack</div><div class="code-block">{skills_html}</div></div>' if skills_html else ''}
        {f'<div class="section"><div class="section-header">📋 Experience</div>{exp_html}</div>' if exp_html else ''}
        {f'<div class="section"><div class="section-header">📦 Projects</div>{proj_html}</div>' if proj_html else ''}
        
        <div class="section">
            <div class="section-header">📫 Contact</div>
            <div class="contact-block">
                {f'<a href="mailto:{d["email"]}">📧 {d["email"]}</a>' if d["email"] else ''}
                {f'<a href="{d["github"]}" target="_blank">🐙 GitHub</a>' if d["github"] else ''}
                {f'<a href="{d["linkedin"]}" target="_blank">💼 LinkedIn</a>' if d["linkedin"] else ''}
            </div>
        </div>
    </div>
</body>
</html>'''


# =============================================================================
# TEMPLATE 6: ELEGANT
# =============================================================================
def generate_elegant_template(data: Dict[str, Any]) -> str:
    d = extract_common_data(data)
    
    skills_html = ""
    all_skills = []
    for skill_list in d["skills"].values():
        for skill in skill_list:
            skill_name = skill.get("name", skill) if isinstance(skill, dict) else skill
            all_skills.append(skill_name)
    skills_html = " • ".join(all_skills[:10])
    
    exp_html = ""
    for exp in d["experience"]:
        exp_html += f'''<article class="experience">
            <div class="exp-meta">
                <span class="period">{exp.get("period", "")}</span>
            </div>
            <div class="exp-details">
                <h3>{exp.get("title", exp.get("role", ""))}</h3>
                <p class="company">{exp.get("company", "")}</p>
                <p class="description">{exp.get("description", "")}</p>
            </div>
        </article>'''
    
    proj_html = ""
    for proj in d["projects"]:
        proj_html += f'''<article class="project">
            <h3>{proj.get("name", proj.get("title", ""))}</h3>
            <p>{proj.get("description", "")}</p>
        </article>'''
    
    edu_html = ""
    for edu in d["education"]:
        edu_html += f'''<div class="edu">
            <span class="degree">{edu.get("degree", "")}</span>
            <span class="school">{edu.get("institution", edu.get("school", ""))} — {edu.get("year", "")}</span>
        </div>'''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{d["name"]} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Montserrat', sans-serif; 
            background: #1c1917; 
            color: #e7e5e4; 
            line-height: 1.8;
            font-size: 15px;
        }}
        h1, h2, h3 {{ font-family: 'Cormorant Garamond', serif; font-weight: 600; }}
        .container {{ max-width: 800px; margin: 0 auto; padding: 100px 32px; }}
        header {{ text-align: center; margin-bottom: 80px; }}
        header h1 {{ 
            font-size: 3.5rem; 
            color: #d4af37;
            letter-spacing: 0.1em;
            margin-bottom: 16px;
        }}
        .title {{ 
            font-size: 1rem; 
            text-transform: uppercase; 
            letter-spacing: 0.3em; 
            color: #a8a29e;
            margin-bottom: 32px;
        }}
        .tagline {{ 
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.4rem;
            font-style: italic;
            color: #78716c;
            max-width: 500px;
            margin: 0 auto;
        }}
        .divider {{ 
            width: 60px; 
            height: 1px; 
            background: #d4af37; 
            margin: 60px auto;
        }}
        section {{ margin-bottom: 64px; }}
        section > h2 {{ 
            font-size: 1.8rem; 
            color: #d4af37;
            margin-bottom: 32px;
            text-align: center;
        }}
        .bio {{ text-align: center; color: #a8a29e; max-width: 600px; margin: 0 auto; }}
        .skills-line {{ text-align: center; color: #78716c; letter-spacing: 0.05em; }}
        .experience {{ display: grid; grid-template-columns: 140px 1fr; gap: 32px; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid #292524; }}
        .experience:last-child {{ border-bottom: none; }}
        .period {{ color: #d4af37; font-size: 0.85rem; letter-spacing: 0.05em; }}
        .exp-details h3 {{ font-size: 1.4rem; color: #f5f5f4; margin-bottom: 4px; }}
        .company {{ color: #d4af37; font-size: 0.9rem; margin-bottom: 12px; }}
        .description {{ color: #a8a29e; }}
        .project {{ margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #292524; }}
        .project:last-child {{ border-bottom: none; }}
        .project h3 {{ font-size: 1.3rem; color: #f5f5f4; margin-bottom: 8px; }}
        .project p {{ color: #a8a29e; }}
        .edu {{ margin-bottom: 16px; }}
        .degree {{ display: block; color: #f5f5f4; }}
        .school {{ color: #78716c; font-size: 0.9rem; }}
        footer {{ text-align: center; padding-top: 40px; border-top: 1px solid #292524; }}
        footer a {{ color: #d4af37; text-decoration: none; margin: 0 16px; font-size: 0.9rem; letter-spacing: 0.05em; }}
        footer a:hover {{ text-decoration: underline; }}
        @media (max-width: 600px) {{ 
            .experience {{ grid-template-columns: 1fr; gap: 8px; }}
            header h1 {{ font-size: 2.5rem; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{d["name"]}</h1>
            <p class="title">{d["title"]}</p>
            <p class="tagline">{d["tagline"] or d["bio"][:100] + "..." if len(d["bio"]) > 100 else d["bio"]}</p>
        </header>
        
        <div class="divider"></div>
        
        <section>
            <h2>About</h2>
            <p class="bio">{d["bio"]}</p>
        </section>
        
        {f'<section><h2>Expertise</h2><p class="skills-line">{skills_html}</p></section>' if skills_html else ''}
        
        <div class="divider"></div>
        
        {f'<section><h2>Experience</h2>{exp_html}</section>' if exp_html else ''}
        {f'<section><h2>Projects</h2>{proj_html}</section>' if proj_html else ''}
        {f'<section><h2>Education</h2>{edu_html}</section>' if edu_html else ''}
        
        <footer>
            {f'<a href="mailto:{d["email"]}">Email</a>' if d["email"] else ''}
            {f'<a href="{d["github"]}" target="_blank">GitHub</a>' if d["github"] else ''}
            {f'<a href="{d["linkedin"]}" target="_blank">LinkedIn</a>' if d["linkedin"] else ''}
        </footer>
    </div>
</body>
</html>'''


# =============================================================================
# TEMPLATE REGISTRY
# =============================================================================
TEMPLATE_GENERATORS = {
    "minimal": generate_minimal_template,
    "modern": generate_modern_template,
    "professional": generate_professional_template,
    "creative": generate_creative_template,
    "developer": generate_developer_template,
    "elegant": generate_elegant_template,
}
