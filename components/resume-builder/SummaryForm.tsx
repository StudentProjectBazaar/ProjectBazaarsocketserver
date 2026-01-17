import React, { useState } from 'react';
import { useResumeInfo } from '../../context/ResumeInfoContext';
import { generateSummarySuggestions } from '../../services/AIResumeService';

interface SummaryFormProps {
  onEnableNext: (enabled: boolean) => void;
}

interface SuggestionItem {
  summary: string;
  experience_level: string;
}

const SummaryForm: React.FC<SummaryFormProps> = ({ onEnableNext }) => {
  const { resumeInfo, updateResumeField } = useResumeInfo();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onEnableNext(false);
    updateResumeField('summary', e.target.value);
  };

  const generateFromAI = async () => {
    if (!resumeInfo.jobTitle) {
      alert('Please add a job title first in Personal Details');
      return;
    }

    setAiLoading(true);
    try {
      const results = await generateSummarySuggestions(resumeInfo.jobTitle);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const selectSuggestion = (summary: string) => {
    updateResumeField('summary', summary);
    onEnableNext(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onEnableNext(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Professional Summary</h2>
            <p className="text-sm text-gray-500">Add a compelling summary for your resume</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Your Summary</label>
            <button
              type="button"
              onClick={generateFromAI}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-all disabled:opacity-50"
            >
              {aiLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              Generate with AI
            </button>
          </div>

          <textarea
            value={resumeInfo.summary}
            onChange={handleChange}
            rows={5}
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
            placeholder="A results-driven professional with extensive experience in..."
          />

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-orange-500/25"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save & Continue'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-orange-500">✨</span> AI Suggestions
          </h3>
          <div className="space-y-4">
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(item.summary)}
                className="w-full text-left p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                    {item.experience_level}
                  </span>
                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to use
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.summary}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryForm;
