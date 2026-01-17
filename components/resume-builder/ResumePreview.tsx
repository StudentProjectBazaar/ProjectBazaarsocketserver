import React from 'react';
import { useResumeInfo } from '../../context/ResumeInfoContext';

// Styles for rich text content
const richTextStyles = `
  .rich-text-content ul {
    list-style-type: disc;
    padding-left: 1.25rem;
    margin: 0.375rem 0;
  }
  .rich-text-content ol {
    list-style-type: decimal;
    padding-left: 1.25rem;
    margin: 0.375rem 0;
  }
  .rich-text-content li {
    display: list-item;
    margin: 0.25rem 0;
    padding-left: 0.25rem;
  }
  .rich-text-content a {
    color: inherit;
    text-decoration: underline;
  }
  .rich-text-content p {
    margin: 0.25rem 0;
  }
  .rich-text-content br {
    display: block;
    content: "";
    margin-top: 0.25rem;
  }
`;

const ResumePreview: React.FC = () => {
  const { resumeInfo } = useResumeInfo();
  const themeColor = resumeInfo.themeColor || '#f97316';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <>
      <style>{richTextStyles}</style>
      <div 
        className="bg-white text-gray-900 p-8 shadow-2xl"
        style={{ 
          borderTop: `6px solid ${themeColor}`,
          minHeight: '100%',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
      {/* Header - Personal Info */}
      <header className="text-center mb-6">
        <h1 
          className="text-2xl font-bold mb-1"
          style={{ color: themeColor }}
        >
          {resumeInfo.firstName || 'Your'} {resumeInfo.lastName || 'Name'}
        </h1>
        {resumeInfo.jobTitle && (
          <p className="text-base font-medium text-gray-700">{resumeInfo.jobTitle}</p>
        )}
        {resumeInfo.address && (
          <p className="text-sm mt-1" style={{ color: themeColor }}>{resumeInfo.address}</p>
        )}
        
        <div className="flex justify-center items-center gap-4 mt-2 text-sm">
          {resumeInfo.phone && (
            <span style={{ color: themeColor }}>{resumeInfo.phone}</span>
          )}
          {resumeInfo.email && (
            <span style={{ color: themeColor }}>{resumeInfo.email}</span>
          )}
        </div>

        {/* Social Links */}
        {(resumeInfo.linkedIn || resumeInfo.github) && (
          <div className="flex justify-center items-center gap-4 mt-2 text-xs text-gray-600">
            {resumeInfo.linkedIn && (
              <a href={resumeInfo.linkedIn} target="_blank" rel="noopener noreferrer" className="hover:underline">
                LinkedIn
              </a>
            )}
            {resumeInfo.github && (
              <a href={resumeInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                GitHub
              </a>
            )}
          </div>
        )}

        <hr className="mt-4" style={{ borderColor: themeColor, borderWidth: '1px' }} />
      </header>

      {/* Summary */}
      {resumeInfo.summary && (
        <section className="mb-5">
          <h2 
            className="text-sm font-bold uppercase tracking-wider mb-2 text-center"
            style={{ color: themeColor }}
          >
            Professional Summary
          </h2>
          <hr className="mb-3" style={{ borderColor: themeColor }} />
          <p className="text-sm leading-relaxed text-gray-700">{resumeInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resumeInfo.experience.length > 0 && (
        <section className="mb-5">
          <h2 
            className="text-sm font-bold uppercase tracking-wider mb-2 text-center"
            style={{ color: themeColor }}
          >
            Professional Experience
          </h2>
          <hr className="mb-3" style={{ borderColor: themeColor }} />
          
          {resumeInfo.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: themeColor }}>
                    {exp.title || 'Position Title'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {exp.companyName}{exp.city && `, ${exp.city}`}{exp.state && `, ${exp.state}`}
                  </p>
                </div>
                <p className="text-xs text-gray-500 text-right whitespace-nowrap">
                  {formatDate(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                </p>
              </div>
              {exp.workSummary && (
                <div 
                  className="text-xs text-gray-700 mt-2 leading-relaxed rich-text-content"
                  dangerouslySetInnerHTML={{ __html: exp.workSummary }}
                  style={{
                    lineHeight: '1.6',
                  }}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resumeInfo.education.length > 0 && (
        <section className="mb-5">
          <h2 
            className="text-sm font-bold uppercase tracking-wider mb-2 text-center"
            style={{ color: themeColor }}
          >
            Education
          </h2>
          <hr className="mb-3" style={{ borderColor: themeColor }} />
          
          {resumeInfo.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: themeColor }}>
                    {edu.universityName || 'University Name'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {edu.degree}{edu.major && ` in ${edu.major}`}
                  </p>
                </div>
                <p className="text-xs text-gray-500 text-right whitespace-nowrap">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </p>
              </div>
              {edu.description && (
                <p className="text-xs text-gray-600 mt-1">{edu.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resumeInfo.skills.length > 0 && (
        <section className="mb-5">
          <h2 
            className="text-sm font-bold uppercase tracking-wider mb-2 text-center"
            style={{ color: themeColor }}
          >
            Skills
          </h2>
          <hr className="mb-3" style={{ borderColor: themeColor }} />
          
          <div className="flex flex-wrap gap-3">
            {resumeInfo.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{skill.name}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: level <= skill.rating ? themeColor : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resumeInfo.projects.length > 0 && (
        <section>
          <h2 
            className="text-sm font-bold uppercase tracking-wider mb-2 text-center"
            style={{ color: themeColor }}
          >
            Projects
          </h2>
          <hr className="mb-3" style={{ borderColor: themeColor }} />
          
          {resumeInfo.projects.map((project) => (
            <div key={project.id} className="mb-3">
              <h3 className="text-sm font-semibold" style={{ color: themeColor }}>
                {project.name}
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-xs font-normal text-gray-500 hover:underline"
                  >
                    ↗
                  </a>
                )}
              </h3>
              {project.description && (
                <p className="text-xs text-gray-600 mt-1">{project.description}</p>
              )}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.technologies.map((tech, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
      </div>
    </>
  );
};

export default ResumePreview;
