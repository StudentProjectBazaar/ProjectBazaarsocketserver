import React, { useState, useMemo } from 'react';

// Types
type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

interface StarterCode {
  python: string;
  javascript: string;
  java: string;
  cpp: string;
  typescript: string;
}

interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  topic: string;
  companies: string[];
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  examples: Example[];
  hints: string[];
  testCases: TestCase[];
  starterCode: StarterCode;
  solution?: string;
  avgTime: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockQuestions: CodingQuestion[] = [
  {
    id: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    topic: 'Arrays',
    companies: ['google', 'amazon', 'meta'],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    inputFormat: 'First line: array of integers\nSecond line: target integer',
    outputFormat: 'Array of two indices',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    hints: ['Try using a hash map to store values you have seen.'],
    testCases: [
      { id: 'tc1', input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { id: 'tc2', input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { id: 'tc3', input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true },
    ],
    starterCode: {
      python: 'def twoSum(nums, target):\n    # Your code here\n    pass',
      javascript: 'function twoSum(nums, target) {\n    // Your code here\n}',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};',
      typescript: 'function twoSum(nums: number[], target: number): number[] {\n    // Your code here\n}',
    },
    avgTime: 15,
    status: 'published',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    difficulty: 'Easy',
    topic: 'Stack',
    companies: ['amazon', 'meta', 'microsoft'],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\'.'],
    inputFormat: 'A string of parentheses',
    outputFormat: 'Boolean (true/false)',
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'The parentheses match.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All parentheses match.' }
    ],
    hints: ['Use a stack to keep track of opening brackets.'],
    testCases: [
      { id: 'tc1', input: '()', expectedOutput: 'true', isHidden: false },
      { id: 'tc2', input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { id: 'tc3', input: '(]', expectedOutput: 'false', isHidden: true },
    ],
    starterCode: {
      python: 'def isValid(s):\n    # Your code here\n    pass',
      javascript: 'function isValid(s) {\n    // Your code here\n}',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n    }\n};',
      typescript: 'function isValid(s: string): boolean {\n    // Your code here\n}',
    },
    avgTime: 20,
    status: 'published',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
  },
];

const topics = ['Arrays', 'Stack', 'Queue', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Greedy Algorithm', 'Sorting', 'Searching', 'Recursion', 'Backtracking', 'Bit Manipulation', 'Math', 'String', 'Hash Table', 'Heap', 'Two Pointers', 'Sliding Window'];

const companies = [
  { id: 'google', name: 'Google' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'meta', name: 'Meta' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'apple', name: 'Apple' },
  { id: 'netflix', name: 'Netflix' },
  { id: 'flipkart', name: 'Flipkart' },
  { id: 'uber', name: 'Uber' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'twitter', name: 'Twitter' },
];

const CodingQuestionsManagementPage: React.FC = () => {
  const [questions, setQuestions] = useState<CodingQuestion[]>(mockQuestions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CodingQuestion | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<CodingQuestion | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'testcases' | 'code' | 'preview'>('details');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      if (selectedStatus !== 'all' && q.status !== selectedStatus) return false;
      return true;
    });
  }, [questions, searchQuery, selectedDifficulty, selectedTopic, selectedStatus]);

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newStatus = q.status === 'published' ? 'archived' : 'published';
        return { ...q, status: newStatus };
      }
      return q;
    }));
  };

  // Stats
  const stats = useMemo(() => ({
    total: questions.length,
    published: questions.filter(q => q.status === 'published').length,
    draft: questions.filter(q => q.status === 'draft').length,
    easy: questions.filter(q => q.difficulty === 'Easy').length,
    medium: questions.filter(q => q.difficulty === 'Medium').length,
    hard: questions.filter(q => q.difficulty === 'Hard').length,
  }), [questions]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Questions</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-sm text-gray-500">Published</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          <div className="text-sm text-gray-500">Drafts</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">{stats.easy}</div>
          <div className="text-sm text-gray-500">Easy</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.medium}</div>
          <div className="text-sm text-gray-500">Medium</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.hard}</div>
          <div className="text-sm text-gray-500">Hard</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* View Toggle & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Generate with AI
            </button>
            <button
              onClick={() => {
                setEditingQuestion(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>
        </div>
      </div>

      {/* Questions View - Table or Grid */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Companies</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Test Cases</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setViewingQuestion(question)}
                        className="text-left hover:text-orange-600 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{question.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{question.description.substring(0, 60)}...</div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{question.topic}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        question.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {question.companies.slice(0, 3).map(companyId => {
                          const company = companies.find(c => c.id === companyId);
                          return (
                            <span key={companyId} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                              {company?.name || companyId}
                            </span>
                          );
                        })}
                        {question.companies.length > 3 && (
                          <span className="text-xs text-gray-500">+{question.companies.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{question.testCases.length}</span>
                        <span className="text-xs text-gray-400">({question.testCases.filter(t => t.isHidden).length} hidden)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(question.id)}
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          question.status === 'published' ? 'bg-green-100 text-green-700' :
                          question.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {question.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingQuestion(question)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setEditingQuestion(question);
                            setShowAddModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-500">No questions found</p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div>
          {filteredQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card Header */}
                  <div className={`h-2 ${
                    question.difficulty === 'Easy' ? 'bg-green-500' :
                    question.difficulty === 'Medium' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                  
                  <div className="p-5">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <button
                        onClick={() => setViewingQuestion(question)}
                        className="text-left hover:text-orange-600 transition-colors flex-1"
                      >
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{question.title}</h3>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(question.id)}
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ml-2 flex-shrink-0 ${
                          question.status === 'published' ? 'bg-green-100 text-green-700' :
                          question.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {question.status}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {question.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        question.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {question.topic}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                        {question.testCases.length} tests
                      </span>
                    </div>

                    {/* Companies */}
                    <div className="flex items-center gap-1 mb-4">
                      {question.companies.slice(0, 4).map(companyId => {
                        const company = companies.find(c => c.id === companyId);
                        return (
                          <div
                            key={companyId}
                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-200"
                            title={company?.name || companyId}
                          >
                            {(company?.name || companyId).charAt(0).toUpperCase()}
                          </div>
                        );
                      })}
                      {question.companies.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{question.companies.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Footer - Stats & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ~{question.avgTime} min
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingQuestion(question)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setEditingQuestion(question);
                            setShowAddModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-500">No questions found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {showAddModal && (
        <QuestionFormModal
          question={editingQuestion}
          onClose={() => {
            setShowAddModal(false);
            setEditingQuestion(null);
          }}
          onSave={(question) => {
            if (editingQuestion) {
              setQuestions(questions.map(q => q.id === question.id ? question : q));
            } else {
              setQuestions([...questions, { ...question, id: Date.now().toString() }]);
            }
            setShowAddModal(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={(importedQuestion) => {
            setQuestions([...questions, { ...importedQuestion, id: Date.now().toString() }]);
            setShowImportModal(false);
          }}
        />
      )}

      {/* View Question Modal */}
      {viewingQuestion && (
        <ViewQuestionModal
          question={viewingQuestion}
          onClose={() => setViewingQuestion(null)}
          onEdit={() => {
            setEditingQuestion(viewingQuestion);
            setViewingQuestion(null);
            setShowAddModal(true);
          }}
        />
      )}
    </div>
  );
};

// Question Form Modal Component
interface QuestionFormModalProps {
  question: CodingQuestion | null;
  onClose: () => void;
  onSave: (question: CodingQuestion) => void;
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({ question, onClose, onSave }) => {
  const [entryMode, setEntryMode] = useState<'manual' | 'ai'>(question ? 'manual' : 'manual');
  const [activeTab, setActiveTab] = useState<'details' | 'testcases' | 'code'>('details');
  const [formData, setFormData] = useState<Partial<CodingQuestion>>(
    question || {
      title: '',
      description: '',
      difficulty: 'Easy',
      topic: 'Arrays',
      companies: [],
      constraints: [''],
      inputFormat: '',
      outputFormat: '',
      examples: [{ input: '', output: '', explanation: '' }],
      hints: [''],
      testCases: [{ id: '1', input: '', expectedOutput: '', isHidden: false }],
      starterCode: {
        python: 'def solution():\n    # Your code here\n    pass',
        javascript: 'function solution() {\n    // Your code here\n}',
        java: 'class Solution {\n    public void solution() {\n        // Your code here\n    }\n}',
        cpp: 'class Solution {\npublic:\n    void solution() {\n        // Your code here\n    }\n};',
        typescript: 'function solution(): void {\n    // Your code here\n}',
      },
      avgTime: 30,
      status: 'draft',
    }
  );

  // AI Generation states
  const [aiTopic, setAiTopic] = useState('Arrays');
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>('Medium');
  const [aiCompanies, setAiCompanies] = useState<string[]>(['google', 'amazon']);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiTestCaseCount, setAiTestCaseCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const generateWithAI = async () => {
    setIsGenerating(true);
    setAiError('');

    const companyNames = aiCompanies.map(id => 
      companies.find(c => c.id === id)?.name || id
    ).join(', ');

    const prompt = `Generate a coding interview question with the following specifications:
- Topic: ${aiTopic}
- Difficulty: ${aiDifficulty}
- Companies that typically ask this: ${companyNames}
${aiCustomPrompt ? `- Additional requirements: ${aiCustomPrompt}` : ''}

Please generate a complete coding interview question in the following JSON format. Make sure the question is unique, challenging, and suitable for technical interviews:

{
  "title": "Question Title",
  "description": "Detailed problem description explaining what the candidate needs to solve. Include clear requirements and edge cases to consider.",
  "difficulty": "${aiDifficulty}",
  "topic": "${aiTopic}",
  "constraints": ["constraint 1", "constraint 2", "constraint 3"],
  "inputFormat": "Description of input format",
  "outputFormat": "Description of expected output format",
  "examples": [
    {
      "input": "Example input 1",
      "output": "Expected output 1",
      "explanation": "Why this is the correct output"
    },
    {
      "input": "Example input 2",
      "output": "Expected output 2", 
      "explanation": "Why this is the correct output"
    }
  ],
  "hints": ["Hint 1 to help solve the problem", "Hint 2 with approach suggestion"],
  "testCases": [
    ${Array.from({ length: aiTestCaseCount }, (_, i) => `{
      "input": "Test case ${i + 1} input",
      "expectedOutput": "Test case ${i + 1} expected output",
      "isHidden": ${i >= 2}
    }`).join(',\n    ')}
  ],
  "starterCode": {
    "python": "def solution(params):\\n    # Your code here\\n    pass",
    "javascript": "function solution(params) {\\n    // Your code here\\n}",
    "java": "class Solution {\\n    public ReturnType solution(ParamType params) {\\n        // Your code here\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    ReturnType solution(ParamType params) {\\n        // Your code here\\n    }\\n};",
    "typescript": "function solution(params: ParamType): ReturnType {\\n    // Your code here\\n}"
  },
  "avgTime": 30
}

Return ONLY the JSON object, no additional text or markdown.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            }
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait 1-2 minutes and try again.');
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) throw new Error('No content generated');

      let cleanedJson = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      // Update form data with AI generated content
      setFormData({
        title: parsed.title || '',
        description: parsed.description || '',
        difficulty: parsed.difficulty || aiDifficulty,
        topic: parsed.topic || aiTopic,
        companies: aiCompanies,
        constraints: parsed.constraints || [],
        inputFormat: parsed.inputFormat || '',
        outputFormat: parsed.outputFormat || '',
        examples: parsed.examples || [],
        hints: parsed.hints || [],
        testCases: (parsed.testCases || []).map((tc: any, idx: number) => ({
          id: `tc-${idx + 1}`,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          isHidden: tc.isHidden || false,
        })),
        starterCode: {
          python: parsed.starterCode?.python || 'def solution():\n    pass',
          javascript: parsed.starterCode?.javascript || 'function solution() {\n}',
          java: parsed.starterCode?.java || 'class Solution {\n}',
          cpp: parsed.starterCode?.cpp || 'class Solution {\n};',
          typescript: parsed.starterCode?.typescript || 'function solution(): void {\n}',
        },
        avgTime: parsed.avgTime || 30,
        status: 'draft',
      });

      // Switch to manual mode to let user review/edit
      setEntryMode('manual');
      setActiveTab('details');
    } catch (err: any) {
      console.error('Generation error:', err);
      setAiError(err.message || 'Failed to generate question. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const now = new Date().toISOString().split('T')[0];
    onSave({
      ...formData,
      id: question?.id || Date.now().toString(),
      createdAt: question?.createdAt || now,
      updatedAt: now,
    } as CodingQuestion);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Entry Mode Toggle - Only show for new questions */}
        {!question && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Create with:</span>
              <button
                onClick={() => setEntryMode('manual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  entryMode === 'manual'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manual Entry
              </button>
              <button
                onClick={() => setEntryMode('ai')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  entryMode === 'ai'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                AI Generate
              </button>
            </div>
          </div>
        )}

        {/* AI Generation Mode */}
        {entryMode === 'ai' && !question && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* AI Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Generate with Gemini AI</h3>
                <p className="text-sm text-gray-500">Describe what you want and AI will create the complete question</p>
              </div>

              {/* Topic & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <select
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Test Cases Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Test Cases: {aiTestCaseCount}</label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={aiTestCaseCount}
                  onChange={(e) => setAiTestCaseCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Companies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Companies (for context)</label>
                <div className="flex flex-wrap gap-2">
                  {companies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => {
                        if (aiCompanies.includes(company.id)) {
                          setAiCompanies(aiCompanies.filter(c => c !== company.id));
                        } else {
                          setAiCompanies([...aiCompanies, company.id]);
                        }
                      }}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        aiCompanies.includes(company.id)
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-500'
                      }`}
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instructions (optional)</label>
                <textarea
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 'Focus on time complexity', 'Include edge cases with empty arrays', 'Similar to binary search problems'..."
                />
              </div>

              {aiError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {aiError}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Question
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                After generation, you can review and edit all fields before saving
              </p>
            </div>
          </div>
        )}

        {/* Manual Entry Mode - Tabs */}
        {(entryMode === 'manual' || question) && (
          <>
            <div className="px-6 border-b border-gray-200">
              <div className="flex gap-4">
                {(['details', 'testcases', 'code'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'details' ? 'Question Details' : tab === 'testcases' ? 'Test Cases' : 'Starter Code'}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Two Sum"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Describe the problem..."
                    />
                  </div>

              {/* Row: Difficulty, Topic, Avg Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                  <select
                    value={formData.difficulty || 'Easy'}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                  <select
                    value={formData.topic || 'Arrays'}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg Time (mins)</label>
                  <input
                    type="number"
                    value={formData.avgTime || 30}
                    onChange={(e) => setFormData({ ...formData, avgTime: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Companies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Companies Asked In</label>
                <div className="flex flex-wrap gap-2">
                  {companies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => {
                        const current = formData.companies || [];
                        if (current.includes(company.id)) {
                          setFormData({ ...formData, companies: current.filter(c => c !== company.id) });
                        } else {
                          setFormData({ ...formData, companies: [...current, company.id] });
                        }
                      }}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        (formData.companies || []).includes(company.id)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-500'
                      }`}
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input/Output Format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Input Format</label>
                  <textarea
                    value={formData.inputFormat || ''}
                    onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Describe input format..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                  <textarea
                    value={formData.outputFormat || ''}
                    onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Describe output format..."
                  />
                </div>
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Constraints</label>
                {(formData.constraints || ['']).map((constraint, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={constraint}
                      onChange={(e) => {
                        const newConstraints = [...(formData.constraints || [''])];
                        newConstraints[idx] = e.target.value;
                        setFormData({ ...formData, constraints: newConstraints });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., 1 <= nums.length <= 10^4"
                    />
                    <button
                      onClick={() => {
                        const newConstraints = (formData.constraints || ['']).filter((_, i) => i !== idx);
                        setFormData({ ...formData, constraints: newConstraints.length ? newConstraints : [''] });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFormData({ ...formData, constraints: [...(formData.constraints || []), ''] })}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  + Add Constraint
                </button>
              </div>

              {/* Examples */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Examples</label>
                {(formData.examples || [{ input: '', output: '', explanation: '' }]).map((example, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Example {idx + 1}</span>
                      <button
                        onClick={() => {
                          const newExamples = (formData.examples || []).filter((_, i) => i !== idx);
                          setFormData({ ...formData, examples: newExamples.length ? newExamples : [{ input: '', output: '', explanation: '' }] });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Input</label>
                        <textarea
                          value={example.input}
                          onChange={(e) => {
                            const newExamples = [...(formData.examples || [])];
                            newExamples[idx] = { ...newExamples[idx], input: e.target.value };
                            setFormData({ ...formData, examples: newExamples });
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Output</label>
                        <textarea
                          value={example.output}
                          onChange={(e) => {
                            const newExamples = [...(formData.examples || [])];
                            newExamples[idx] = { ...newExamples[idx], output: e.target.value };
                            setFormData({ ...formData, examples: newExamples });
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-xs text-gray-500">Explanation</label>
                      <input
                        type="text"
                        value={example.explanation}
                        onChange={(e) => {
                          const newExamples = [...(formData.examples || [])];
                          newExamples[idx] = { ...newExamples[idx], explanation: e.target.value };
                          setFormData({ ...formData, examples: newExamples });
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setFormData({ ...formData, examples: [...(formData.examples || []), { input: '', output: '', explanation: '' }] })}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  + Add Example
                </button>
              </div>

              {/* Hints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hints</label>
                {(formData.hints || ['']).map((hint, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...(formData.hints || [''])];
                        newHints[idx] = e.target.value;
                        setFormData({ ...formData, hints: newHints });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Add a hint..."
                    />
                    <button
                      onClick={() => {
                        const newHints = (formData.hints || ['']).filter((_, i) => i !== idx);
                        setFormData({ ...formData, hints: newHints.length ? newHints : [''] });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFormData({ ...formData, hints: [...(formData.hints || []), ''] })}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  + Add Hint
                </button>
              </div>
            </div>
          )}

          {activeTab === 'testcases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Test Cases</h3>
                <button
                  onClick={() => {
                    const newTestCase: TestCase = {
                      id: Date.now().toString(),
                      input: '',
                      expectedOutput: '',
                      isHidden: false,
                    };
                    setFormData({ ...formData, testCases: [...(formData.testCases || []), newTestCase] });
                  }}
                  className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
                >
                  + Add Test Case
                </button>
              </div>

              {(formData.testCases || []).map((testCase, idx) => (
                <div key={testCase.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-700">Test Case {idx + 1}</span>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={testCase.isHidden}
                          onChange={(e) => {
                            const newTestCases = [...(formData.testCases || [])];
                            newTestCases[idx] = { ...newTestCases[idx], isHidden: e.target.checked };
                            setFormData({ ...formData, testCases: newTestCases });
                          }}
                          className="rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-600">Hidden</span>
                      </label>
                    </div>
                    <button
                      onClick={() => {
                        const newTestCases = (formData.testCases || []).filter((_, i) => i !== idx);
                        setFormData({ ...formData, testCases: newTestCases });
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Input</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => {
                          const newTestCases = [...(formData.testCases || [])];
                          newTestCases[idx] = { ...newTestCases[idx], input: e.target.value };
                          setFormData({ ...formData, testCases: newTestCases });
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter input..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Expected Output</label>
                      <textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => {
                          const newTestCases = [...(formData.testCases || [])];
                          newTestCases[idx] = { ...newTestCases[idx], expectedOutput: e.target.value };
                          setFormData({ ...formData, testCases: newTestCases });
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-500"
                        placeholder="Expected output..."
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs text-gray-500 mb-1 block">Explanation (optional)</label>
                    <input
                      type="text"
                      value={testCase.explanation || ''}
                      onChange={(e) => {
                        const newTestCases = [...(formData.testCases || [])];
                        newTestCases[idx] = { ...newTestCases[idx], explanation: e.target.value };
                        setFormData({ ...formData, testCases: newTestCases });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                      placeholder="Explain this test case..."
                    />
                  </div>
                </div>
              ))}

              {(formData.testCases || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No test cases added yet. Click "Add Test Case" to create one.
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-6">
              <h3 className="font-medium text-gray-900">Starter Code Templates</h3>
              
              {(['python', 'javascript', 'java', 'cpp', 'typescript'] as const).map(lang => (
                <div key={lang} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <span className="font-medium text-gray-700 capitalize">{lang === 'cpp' ? 'C++' : lang}</span>
                  </div>
                  <textarea
                    value={formData.starterCode?.[lang] || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        starterCode: {
                          ...formData.starterCode!,
                          [lang]: e.target.value,
                        },
                      });
                    }}
                    rows={8}
                    className="w-full px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder={`Enter ${lang} starter code...`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Only show for manual mode */}
        {(entryMode === 'manual' || question) && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div>
              <label className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {question ? 'Update Question' : 'Create Question'}
              </button>
            </div>
          </div>
        )}

        {/* Footer for AI mode - just cancel button */}
        {entryMode === 'ai' && !question && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

// AI Generation Modal Component - Uses Gemini API
interface ImportModalProps {
  onClose: () => void;
  onImport: (question: CodingQuestion) => void;
}

const GEMINI_API_KEY = 'AIzaSyBKwvFQlABgxUIZyYR7TR5phnw3LP512cA';

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['google', 'amazon']);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuestion, setGeneratedQuestion] = useState<CodingQuestion | null>(null);
  const [numberOfTestCases, setNumberOfTestCases] = useState(5);

  const generateWithGemini = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratedQuestion(null);

    const companyNames = selectedCompanies.map(id => 
      companies.find(c => c.id === id)?.name || id
    ).join(', ');

    const prompt = `Generate a coding interview question with the following specifications:
- Topic: ${topic}
- Difficulty: ${difficulty}
- Companies that typically ask this: ${companyNames}
${customPrompt ? `- Additional requirements: ${customPrompt}` : ''}

Please generate a complete coding interview question in the following JSON format. Make sure the question is unique, challenging, and suitable for technical interviews:

{
  "title": "Question Title",
  "description": "Detailed problem description explaining what the candidate needs to solve. Include clear requirements and edge cases to consider.",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "constraints": ["constraint 1", "constraint 2", "constraint 3"],
  "inputFormat": "Description of input format",
  "outputFormat": "Description of expected output format",
  "examples": [
    {
      "input": "Example input 1",
      "output": "Expected output 1",
      "explanation": "Why this is the correct output"
    },
    {
      "input": "Example input 2",
      "output": "Expected output 2",
      "explanation": "Why this is the correct output"
    }
  ],
  "hints": ["Hint 1 to help solve the problem", "Hint 2 with approach suggestion"],
  "testCases": [
    ${Array.from({ length: numberOfTestCases }, (_, i) => `{
      "input": "Test case ${i + 1} input",
      "expectedOutput": "Test case ${i + 1} expected output",
      "isHidden": ${i >= 2}
    }`).join(',\n    ')}
  ],
  "starterCode": {
    "python": "def solution(params):\\n    # Your code here\\n    pass",
    "javascript": "function solution(params) {\\n    // Your code here\\n}",
    "java": "class Solution {\\n    public ReturnType solution(ParamType params) {\\n        // Your code here\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    ReturnType solution(ParamType params) {\\n        // Your code here\\n    }\\n};",
    "typescript": "function solution(params: ParamType): ReturnType {\\n    // Your code here\\n}"
  },
  "avgTime": 30
}

Return ONLY the JSON object, no additional text or markdown.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No content generated');
      }

      // Clean up the response - remove markdown code blocks if present
      let cleanedJson = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedJson);
      
      const question: CodingQuestion = {
        id: Date.now().toString(),
        title: parsed.title || 'Untitled Question',
        description: parsed.description || '',
        difficulty: parsed.difficulty || difficulty,
        topic: parsed.topic || topic,
        companies: selectedCompanies,
        constraints: parsed.constraints || [],
        inputFormat: parsed.inputFormat || '',
        outputFormat: parsed.outputFormat || '',
        examples: parsed.examples || [],
        hints: parsed.hints || [],
        testCases: (parsed.testCases || []).map((tc: any, idx: number) => ({
          id: `tc-${idx + 1}`,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          isHidden: tc.isHidden || false,
          explanation: tc.explanation || '',
        })),
        starterCode: {
          python: parsed.starterCode?.python || 'def solution():\n    pass',
          javascript: parsed.starterCode?.javascript || 'function solution() {\n}',
          java: parsed.starterCode?.java || 'class Solution {\n}',
          cpp: parsed.starterCode?.cpp || 'class Solution {\n};',
          typescript: parsed.starterCode?.typescript || 'function solution(): void {\n}',
        },
        avgTime: parsed.avgTime || 30,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setGeneratedQuestion(question);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate question. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generate with Gemini AI</h2>
              <p className="text-white/80 text-sm">Create coding questions automatically</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!generatedQuestion ? (
            <div className="space-y-6">
              {/* Topic & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {topics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Number of Test Cases */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Test Cases</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={numberOfTestCases}
                    onChange={(e) => setNumberOfTestCases(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-lg font-semibold text-purple-600 min-w-[2rem] text-center">{numberOfTestCases}</span>
                </div>
              </div>

              {/* Companies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Companies (for context)</label>
                <div className="flex flex-wrap gap-2">
                  {companies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => {
                        if (selectedCompanies.includes(company.id)) {
                          setSelectedCompanies(selectedCompanies.filter(c => c !== company.id));
                        } else {
                          setSelectedCompanies([...selectedCompanies, company.id]);
                        }
                      }}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        selectedCompanies.includes(company.id)
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-500'
                      }`}
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 'Focus on time complexity optimization', 'Include edge cases with empty arrays', 'Similar to merge sort problems'..."
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generateWithGemini}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {isGenerating ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating with Gemini AI...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Question
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Preview Generated Question */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Generated Question Preview</h3>
                <button
                  onClick={() => setGeneratedQuestion(null)}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  ← Generate Another
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{generatedQuestion.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        generatedQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        generatedQuestion.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {generatedQuestion.difficulty}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {generatedQuestion.topic}
                      </span>
                      <span className="text-xs text-gray-500">
                        ~{generatedQuestion.avgTime} mins
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Description</h5>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{generatedQuestion.description}</p>
                </div>

                {generatedQuestion.constraints.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Constraints</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {generatedQuestion.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {generatedQuestion.examples.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Examples</h5>
                    {generatedQuestion.examples.map((ex, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2 text-sm font-mono">
                        <div><strong>Input:</strong> {ex.input}</div>
                        <div><strong>Output:</strong> {ex.output}</div>
                        {ex.explanation && <div className="text-gray-500 mt-1">{ex.explanation}</div>}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Test Cases: {generatedQuestion.testCases.length}</h5>
                  <p className="text-xs text-gray-500">
                    {generatedQuestion.testCases.filter(t => !t.isHidden).length} visible, {' '}
                    {generatedQuestion.testCases.filter(t => t.isHidden).length} hidden
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Companies</h5>
                  <div className="flex flex-wrap gap-1">
                    {generatedQuestion.companies.map(companyId => {
                      const company = companies.find(c => c.id === companyId);
                      return (
                        <span key={companyId} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                          {company?.name || companyId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          {generatedQuestion && (
            <button
              onClick={() => onImport(generatedQuestion)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700"
            >
              Add to Questions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// View Question Modal
interface ViewQuestionModalProps {
  question: CodingQuestion;
  onClose: () => void;
  onEdit: () => void;
}

const ViewQuestionModal: React.FC<ViewQuestionModalProps> = ({ question, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'code'>('description');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{question.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                question.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {question.difficulty}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{question.topic}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                question.status === 'published' ? 'bg-green-100 text-green-700' :
                question.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {question.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Edit
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 border-b border-gray-200">
          <div className="flex gap-4">
            {(['description', 'testcases', 'code'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'description' ? 'Description' : tab === 'testcases' ? 'Test Cases' : 'Starter Code'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{question.description}</p>
              </div>

              {question.constraints.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Constraints</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {question.examples.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Examples</h3>
                  {question.examples.map((ex, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 mb-2">
                      <div className="font-mono text-sm">
                        <div><strong>Input:</strong> {ex.input}</div>
                        <div><strong>Output:</strong> {ex.output}</div>
                        {ex.explanation && <div className="text-gray-600 mt-1"><strong>Explanation:</strong> {ex.explanation}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question.hints.length > 0 && question.hints[0] && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Hints</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {question.hints.filter(h => h).map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Companies</h3>
                <div className="flex flex-wrap gap-2">
                  {question.companies.map(companyId => {
                    const company = companies.find(c => c.id === companyId);
                    return (
                      <span key={companyId} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                        {company?.name || companyId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testcases' && (
            <div className="space-y-4">
              {question.testCases.map((tc, i) => (
                <div key={tc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-700">Test Case {i + 1}</span>
                    {tc.isHidden && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Hidden</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Input</label>
                      <pre className="bg-gray-50 p-2 rounded text-sm font-mono mt-1">{tc.input}</pre>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Expected Output</label>
                      <pre className="bg-gray-50 p-2 rounded text-sm font-mono mt-1">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              {Object.entries(question.starterCode).map(([lang, code]) => (
                <div key={lang} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700 capitalize">{lang === 'cpp' ? 'C++' : lang}</span>
                  </div>
                  <pre className="p-4 text-sm font-mono overflow-x-auto">{code}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingQuestionsManagementPage;
