import React, { useState } from 'react';
import { useResumeInfo, Education } from '../../context/ResumeInfoContext';

const EducationForm: React.FC = () => {
  const { resumeInfo, updateResumeField } = useResumeInfo();
  const [loading, setLoading] = useState(false);

  const createEmptyEducation = (): Education => ({
    id: `edu_${Date.now()}`,
    universityName: '',
    degree: '',
    major: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const handleChange = (index: number, field: keyof Education, value: string) => {
    const updated = [...resumeInfo.education];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeField('education', updated);
  };

  const addEducation = () => {
    updateResumeField('education', [...resumeInfo.education, createEmptyEducation()]);
  };

  const removeEducation = (index: number) => {
    const updated = resumeInfo.education.filter((_, i) => i !== index);
    updateResumeField('education', updated);
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
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Education</h2>
          <p className="text-sm text-gray-500">Add your educational background</p>
        </div>
      </div>

      <div className="space-y-6">
        {resumeInfo.education.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p>No education added yet. Click "Add Education" to get started.</p>
          </div>
        ) : (
          resumeInfo.education.map((edu, index) => (
            <div key={edu.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-orange-600">Education {index + 1}</span>
                <button
                  onClick={() => removeEducation(index)}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">University / Institution Name</label>
                  <input
                    type="text"
                    value={edu.universityName}
                    onChange={(e) => handleChange(index, 'universityName', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="Stanford University"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleChange(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="Bachelor's / Master's"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Major / Field of Study</label>
                  <input
                    type="text"
                    value={edu.major}
                    onChange={(e) => handleChange(index, 'major', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
                  <input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                  <input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Description (Optional)</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                    placeholder="Relevant coursework, achievements, GPA..."
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
            onClick={addEducation}
            className="px-4 py-2.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-all"
          >
            + Add Education
          </button>
          {resumeInfo.education.length > 0 && (
            <button
              type="button"
              onClick={() => removeEducation(resumeInfo.education.length - 1)}
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

export default EducationForm;
