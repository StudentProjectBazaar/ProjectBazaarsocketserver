# Career Guidance Hub - Code Explanation

## Overview
The Career Guidance Hub is a comprehensive feature in the buyer dashboard that helps B.Tech students and fresh graduates explore careers, get AI-powered career recommendations, access learning roadmaps, prepare for placements, and find project ideas.

## Architecture

### Frontend Component
**File:** `components/CareerGuidancePage.tsx` (2957 lines)

### Backend Lambda Functions
1. **career_guidance_content_handler.py** - Manages trending careers and project ideas
2. **roadmap_management_handler.py** - Manages learning roadmaps, categories, weeks, quizzes

### Data Storage
- **DynamoDB Tables:**
  - `TrendingCareers` - Stores trending career information
  - `ProjectIdeas` - Stores project ideas
  - `Roadmaps` - Stores roadmap categories, weeks, resources, and quizzes

---

## Component Structure

### Main Component: `CareerGuidancePage`

The component has **5 main tabs**:

1. **Trending Careers** (`trending`)
2. **Career Match** (`recommend`) - AI-powered recommendation
3. **Roadmap** (`roadmap`) - Learning path generator
4. **Placement Prep** (`placement`)
5. **Project Ideas** (`projects`)

---

## Tab 1: Trending Careers

### Features:
- Displays hot tech careers with salary, growth rate, demand level
- Shows skills required and top companies hiring
- Click to expand and see detailed information
- "Explore Roadmap" button to navigate to roadmap tab

### Data Flow:
1. **On Mount:** Fetches data from API endpoint
   ```typescript
   API_ENDPOINT = 'https://kuxbswn0c9.execute-api.ap-south-2.amazonaws.com/default/Trendingcarrers_ProjectIdeas'
   ```
2. **Request:** POST with `{ section: 'trending', action: 'list' }`
3. **Response:** Array of `TrendingCareer` objects
4. **Fallback:** Uses localStorage or default data if API fails

### Data Structure:
```typescript
interface TrendingCareer {
    title: string;
    avgSalary: string;        // e.g., "₹8-25 LPA"
    growth: string;            // e.g., "+40%"
    demand: 'Very High' | 'High' | 'Medium';
    skills: string[];
    companies: string[];
    description: string;
    links?: string[];          // roadmap links
}
```

### Component: `TrendingCareersSection`
- Renders career cards in a grid
- Shows stats header (8+ careers, ₹25L+ max salary, etc.)
- Expandable cards with detailed information
- Links to roadmap feature

---

## Tab 2: Career Match (AI Recommendation)

### Features:
- Multi-step questionnaire (4 steps)
- AI-powered career recommendation
- Progress bar showing completion
- Option to generate again or continue to roadmap

### Flow:
1. **Step 0:** Select specialization (CSE, IT, ECE, etc.)
2. **Step 1:** Select interests (Cloud, ML, Web Dev, etc.)
3. **Step 2:** Select skills (Python, React, AWS, etc.)
4. **Step 3:** Add certifications
5. **Step 4:** Loading - AI analyzes profile
6. **Step 5:** Display results with top recommendation

### API Integration:
```typescript
// External API for career recommendation
POST https://harshalnelge.pythonanywhere.com/career/recommend/
Body: FormData with specialization, interest, skills, certification
```

### Components:
- **Selector:** Reusable component for multi-select options
- **ProgressBar:** Shows step progress
- **LoadingSpinner:** Shows during AI analysis
- **ResultComponent:** Displays recommendation results

### State Management:
```typescript
const [recommendStep, setRecommendStep] = useState<RecommendStep>(0);
const [responses, setResponses] = useState<string[][]>([]);
const [careerResult, setCareerResult] = useState<string[] | null>(null);
```

---

## Tab 3: Roadmap (Learning Path)

### Features:
- Category selection (AI/ML, Web Dev, Data Science, etc.)
- Duration selection (4-24 weeks)
- Current level selection (Beginner/Intermediate/Advanced)
- Weekly learning content with:
  - Main topics
  - Subtopics
  - Practical tasks
  - Mini projects
  - Learning resources (GeeksforGeeks, YouTube, Documentation, etc.)
  - Weekly quizzes
- Final exam (20 questions)
- Certificate generation (if score ≥ 80%)

### Roadmap Steps:
1. **Analysis:** Select category, duration, level
2. **Roadmap:** View weekly learning plan
3. **Progress:** Take weekly quizzes
4. **Exam:** Take final exam
5. **Evaluation:** View results and certificate

### Data Flow:

#### 1. Load Categories
```typescript
ROADMAP_API_ENDPOINT = 'https://07wee2lkxj.execute-api.ap-south-2.amazonaws.com/default/Roadmaps_get_post_put'
POST { resource: 'categories', action: 'list' }
```

#### 2. Generate Roadmap
```typescript
POST { resource: 'roadmap', action: 'get', categoryId: '...' }
```

#### 3. Roadmap Structure
```typescript
interface RoadmapData {
    careerGoal: string;
    totalWeeks: number;
    weeks: WeekContent[];
    createdAt: string;
}

interface WeekContent {
    weekNumber: number;
    mainTopics: string[];
    subtopics: string[];
    practicalTasks: string[];
    miniProject: string;
    resources?: WeekResource[];
    quiz?: QuizQuestion[];
    isCompleted: boolean;
    quizCompleted: boolean;
}
```

### Roadmap Feature Component: `RoadmapFeature`
- Handles all roadmap-related state and logic
- Manages category selection, roadmap generation, quiz taking, exam taking
- Tracks progress (completed weeks, quiz scores)
- Generates certificates

### Quiz System:
- **Weekly Quizzes:** Admin-managed questions stored in roadmap data
- **Final Exam:** 20 static questions (can be moved to API later)
- **Scoring:** Percentage-based with feedback
- **Unlocking:** Next week unlocks after completing current week + quiz

### Certificate Generation:
- Generated if final exam score ≥ 80%
- Contains: Name, Career, Score, Date
- Displayed in evaluation step

---

## Tab 4: Placement Prep

### Features:
- **Timeline:**** Campus placement preparation timeline (3rd year to 4th year)
- **Topics:** Critical placement topics with resources
- **Quick Links:** LeetCode, Pramp, GitHub

### Topics Covered:
1. Data Structures & Algorithms (Critical)
2. System Design (Important)
3. Core CS Subjects (Important)
4. Aptitude & Reasoning (Good to Know)
5. Communication Skills (Important)

### Component: `PlacementPrepSection`
- Displays timeline with color-coded phases
- Expandable topic cards with resources
- Links to external learning platforms

---

## Tab 5: Project Ideas

### Features:
- Filter by difficulty (Beginner/Intermediate/Advanced)
- Expandable project cards with:
  - Description
  - Technologies
  - Duration
  - Features to build
  - GitHub links
  - Demo links
- Quick actions: Find similar on GitHub, Watch tutorials

### Data Flow:
1. Fetches from API: `{ section: 'projects', action: 'list' }`
2. Falls back to localStorage or default data

### Component: `ProjectIdeasSection`
- Grid layout of project cards
- Difficulty filter
- Expandable details with resources

---

## Backend Lambda Functions

### 1. career_guidance_content_handler.py

**Purpose:** CRUD operations for trending careers and project ideas

**Endpoints:**
- `POST /default/Trendingcarrers_ProjectIdeas`

**Actions:**
- `list` - Get all items for a section
- `put` - Replace entire list (admin use)
- `delete` - Delete single item

**DynamoDB Tables:**
- `TrendingCareers` - Stores career data
- `ProjectIdeas` - Stores project ideas

**Data Normalization:**
- Validates and normalizes input data
- Handles arrays (skills, companies, technologies, etc.)
- Adds timestamps (createdAt, updatedAt)

### 2. roadmap_management_handler.py

**Purpose:** Manages learning roadmaps, categories, weeks, resources, quizzes

**Endpoints:**
- `POST /default/Roadmaps_get_post_put`

**Actions:**
- `categories` + `list` - Get all categories
- `roadmap` + `get` - Get roadmap for category
- `roadmap` + `put` - Save/update roadmap (admin)

**DynamoDB Table:**
- `Roadmaps` - Single table with categoryId as key

**Data Structure:**
```python
{
    'categoryId': 'ai-ml',
    'categoryName': 'AI/ML Engineer',
    'icon': '🤖',
    'weeks': [
        {
            'weekNumber': 1,
            'mainTopics': [...],
            'subtopics': [...],
            'practicalTasks': [...],
            'miniProject': '...',
            'resources': [...],
            'quiz': [...]
        }
    ],
    'createdAt': '...',
    'updatedAt': '...'
}
```

---

## State Management

### Main State Variables:
```typescript
// Tab management
const [activeTab, setActiveTab] = useState<CareerTab>('trending');

// Trending careers
const [trendingCareersData, setTrendingCareersData] = useState<TrendingCareer[]>([]);

// Project ideas
const [projectIdeasData, setProjectIdeasData] = useState<ProjectIdea[]>([]);

// Career recommendation
const [recommendStep, setRecommendStep] = useState<RecommendStep>(0);
const [responses, setResponses] = useState<string[][]>([]);
const [careerResult, setCareerResult] = useState<string[] | null>(null);

// Roadmap
const [roadmapStep, setRoadmapStep] = useState<'analysis' | 'roadmap' | 'progress' | 'exam' | 'evaluation'>('analysis');
const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
const [weeklyQuiz, setWeeklyQuiz] = useState<WeeklyQuiz | null>(null);
const [finalExam, setFinalExam] = useState<FinalExam | null>(null);
const [certificate, setCertificate] = useState<Certificate | null>(null);
```

---

## Data Flow Diagram

```
User Opens Career Guidance Hub
    ↓
CareerGuidancePage Component Loads
    ↓
useEffect: Fetch Trending Careers & Project Ideas
    ├─→ API: POST /Trendingcarrers_ProjectIdeas
    │   └─→ Lambda: career_guidance_content_handler.py
    │       └─→ DynamoDB: TrendingCareers, ProjectIdeas
    └─→ Fallback: localStorage or default data
    ↓
User Selects Tab
    ├─→ Trending: Display careers from state
    ├─→ Recommend: Multi-step questionnaire → External AI API
    ├─→ Roadmap: 
    │   ├─→ Load categories from API
    │   ├─→ Select category → Generate roadmap
    │   ├─→ Take quizzes → Update progress
    │   └─→ Take exam → Generate certificate
    ├─→ Placement: Static content with resources
    └─→ Projects: Display project ideas from state
```

---

## Key Features & Functionality

### 1. **Data Persistence**
- API-first approach with localStorage fallback
- Default data for offline/fallback scenarios
- Admin can update content via API

### 2. **User Experience**
- Loading states for all async operations
- Error handling with user-friendly messages
- Progress tracking for multi-step flows
- Responsive design for mobile/desktop

### 3. **Roadmap System**
- Dynamic category loading from admin
- Weekly content with resources
- Quiz system for assessment
- Certificate generation
- Progress tracking (completed weeks, quiz scores)

### 4. **Career Recommendation**
- Multi-step questionnaire
- External AI API integration
- Fallback to mock data if API fails
- Seamless transition to roadmap

### 5. **Resource Management**
- Learning resources (GeeksforGeeks, YouTube, Documentation, etc.)
- External links to practice platforms
- GitHub integration for projects

---

## Integration Points

### 1. **Dashboard Integration**
- Accessed via `DashboardContent.tsx` when `activeView === 'career-guidance'`
- Toggle sidebar support for mobile
- Embedded in buyer dashboard

### 2. **API Endpoints**
- Career Content: `https://kuxbswn0c9.execute-api.ap-south-2.amazonaws.com/default/Trendingcarrers_ProjectIdeas`
- Roadmaps: `https://07wee2lkxj.execute-api.ap-south-2.amazonaws.com/default/Roadmaps_get_post_put`
- Career Recommendation: `https://harshalnelge.pythonanywhere.com/career/recommend/`

### 3. **Admin Dashboard**
- Admin can manage trending careers and project ideas
- Admin can create/edit roadmaps with weeks, resources, quizzes
- Changes reflect immediately in buyer dashboard

---

## Code Organization

### Components:
1. `CareerGuidancePage` - Main container
2. `TrendingCareersSection` - Trending careers display
3. `PlacementPrepSection` - Placement preparation
4. `ProjectIdeasSection` - Project ideas display
5. `Selector` - Reusable multi-select component
6. `RoadmapFeature` - Complete roadmap system
7. `ProgressBar` - Progress indicator
8. `LoadingSpinner` - Loading state
9. `ResultComponent` - Career recommendation results

### Utilities:
- `saveTrendingCareers()` - Save to localStorage
- `saveProjectIdeas()` - Save to localStorage
- `loadFromStorage()` - Load from localStorage

### Icons:
- Custom SVG icons (SparkleIcon, CheckIcon, RoadmapIcon, etc.)

---

## Error Handling

1. **API Failures:**
   - Falls back to localStorage
   - Falls back to default data
   - Shows error messages to user

2. **Missing Data:**
   - Shows "No data available" messages
   - Prompts admin to add data

3. **Validation:**
   - Validates category selection
   - Validates duration (4-24 weeks)
   - Validates quiz answers before submission

---

## Future Enhancements (Potential)

1. User progress persistence (save roadmap progress to backend)
2. Social features (share roadmaps, compare progress)
3. More quiz questions in database
4. Video integration for learning resources
5. Achievement badges
6. Personalized recommendations based on progress

---

## Summary

The Career Guidance Hub is a comprehensive feature that:
- **Helps students** discover trending careers
- **Provides AI-powered** career recommendations
- **Offers structured** learning roadmaps with quizzes
- **Prepares students** for campus placements
- **Suggests project ideas** to build portfolio

All data is managed through AWS Lambda functions and DynamoDB, with a robust fallback system for offline scenarios.

