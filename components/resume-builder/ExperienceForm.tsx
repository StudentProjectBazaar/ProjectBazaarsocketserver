import React, { useState } from 'react';
import { useResumeInfo, Experience } from '../../context/ResumeInfoContext';
import RichTextEditor from './RichTextEditor';

const ExperienceForm: React.FC = () => {
  const { resumeInfo, updateResumeField } = useResumeInfo();
  const [loading, setLoading] = useState(false);

  const createEmptyExperience = (): Experience => ({
    id: `exp_${Date.now()}`,
    title: '',
    companyName: '',
    city: '',
    state: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    workSummary: '',
  });

  const handleChange = (index: number, field: keyof Experience, value: string | boolean) => {
    const updated = [...resumeInfo.experience];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeField('experience', updated);
  };

  const addExperience = () => {
    updateResumeField('experience', [...resumeInfo.experience, createEmptyExperience()]);
  };

  const removeExperience = (index: number) => {
    const updated = resumeInfo.experience.filter((_, i) => i !== index);
    updateResumeField('experience', updated);
  };

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Professional Experience</h2>
          <p className="text-sm text-gray-500">Add your work experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {resumeInfo.experience.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p>No experience added yet. Click "Add Experience" to get started.</p>
          </div>
        ) : (
          resumeInfo.experience.map((exp, index) => (
            <div key={exp.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-orange-600">Experience {index + 1}</span>
                <button
                  onClick={() => removeExperience(index)}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Position Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => handleChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="Senior Developer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={exp.companyName}
                    onChange={(e) => handleChange(index, 'companyName', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="Tech Company Inc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                  <input
                    type="text"
                    value={exp.city}
                    onChange={(e) => handleChange(index, 'city', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
                  <input
                    type="text"
                    value={exp.state}
                    onChange={(e) => handleChange(index, 'state', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                  <div className="space-y-2">
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                      disabled={exp.currentlyWorking}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 disabled:bg-gray-100"
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.currentlyWorking}
                        onChange={(e) => handleChange(index, 'currentlyWorking', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      Currently working here
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Work Description</label>
                  <RichTextEditor
                    value={exp.workSummary}
                    onChange={(value) => handleChange(index, 'workSummary', value)}
                    placeholder="Describe your responsibilities and achievements..."
                    positionTitle={exp.title}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={addExperience}
            className="px-4 py-2.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-all"
          >
            + Add Experience
          </button>
          {resumeInfo.experience.length > 0 && (
            <button
              type="button"
              onClick={() => removeExperience(resumeInfo.experience.length - 1)}
              className="px-4 py-2.5 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
            >
              - Remove Last
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-500/25"
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
            'Save'
          )}
        </button>
      </div>
    </div>
  );
};

export default ExperienceForm;
