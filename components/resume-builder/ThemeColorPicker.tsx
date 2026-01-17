import React, { useState } from 'react';
import { useResumeInfo } from '../../context/ResumeInfoContext';

const THEME_COLORS = [
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Slate', value: '#475569' },
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Lime', value: '#65a30d' },
];

const ThemeColorPicker: React.FC = () => {
  const { resumeInfo, updateResumeField } = useResumeInfo();
  const [isOpen, setIsOpen] = useState(false);

  const selectedColor = resumeInfo.themeColor || '#f97316';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
      >
        <div 
          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm text-gray-600">Theme</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[200px]">
            <p className="text-xs text-gray-500 mb-3 font-medium">Choose Theme Color</p>
            <div className="grid grid-cols-4 gap-2">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    updateResumeField('themeColor', color.value);
                    setIsOpen(false);
                  }}
                  className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                    selectedColor === color.value 
                      ? 'ring-2 ring-gray-900 ring-offset-2' 
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <label className="text-xs text-gray-500 block mb-2 font-medium">Custom Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => updateResumeField('themeColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => {
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                      updateResumeField('themeColor', e.target.value);
                    }
                  }}
                  className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-900 font-mono"
                  placeholder="#f97316"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeColorPicker;
