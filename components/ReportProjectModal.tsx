import React, { useState } from 'react';
import { reportProject, ReportProjectRequest } from '../services/buyerApi';

interface ReportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  buyerId: string;
  isPurchased?: boolean; // Whether the user has purchased this project
  onSuccess?: () => void;
}

const ALL_REPORT_REASONS = [
  { value: 'NOT_WORKING', label: 'Project Not Working', description: 'Project fails to run or has critical errors', requiresPurchase: true },
  { value: 'MISSING_FILES', label: 'Missing Files', description: 'Required files or dependencies are missing', requiresPurchase: true },
  { value: 'POOR_QUALITY', label: 'Poor Quality', description: 'Code quality is below expectations', requiresPurchase: false },
  { value: 'MISMATCHED_DESCRIPTION', label: 'Description Mismatch', description: 'Project does not match the description or preview', requiresPurchase: false },
  { value: 'SCAM', label: 'Suspected Scam', description: 'Project appears to be fraudulent or malicious', requiresPurchase: false },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content', description: 'Project contains inappropriate, offensive, or harmful content', requiresPurchase: false },
  { value: 'COPYRIGHT_VIOLATION', label: 'Copyright Violation', description: 'Project appears to violate copyright or intellectual property', requiresPurchase: false },
  { value: 'OTHER', label: 'Other', description: 'Other issues not listed above', requiresPurchase: false },
];

const ReportProjectModal: React.FC<ReportProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  buyerId,
  isPurchased = false,
  onSuccess,
}) => {
  // Filter reasons based on purchase status
  const REPORT_REASONS = ALL_REPORT_REASONS.filter(reason => 
    !reason.requiresPurchase || isPurchased
  );
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachments, setAttachments] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setReason('');
      setDescription('');
      setAttachments(['']);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const handleAttachmentChange = (index: number, value: string) => {
    const newAttachments = [...attachments];
    newAttachments[index] = value;
    setAttachments(newAttachments);
  };

  const addAttachmentField = () => {
    if (attachments.length < 5) {
      setAttachments([...attachments, '']);
    }
  };

  const removeAttachmentField = (index: number) => {
    if (attachments.length > 1) {
      const newAttachments = attachments.filter((_, i) => i !== index);
      setAttachments(newAttachments);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URLs are allowed (will be filtered)
    const urlPattern = /^https?:\/\/.+$/;
    return urlPattern.test(url.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!buyerId) {
      setError('You must be logged in to report a project');
      return;
    }

    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    // Validate attachment URLs
    const validAttachments = attachments
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (validAttachments.length > 5) {
      setError('Maximum 5 attachments allowed');
      return;
    }

    for (const url of validAttachments) {
      if (!validateUrl(url)) {
        setError('Please provide valid URLs for attachments (must start with http:// or https://)');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const reportData: ReportProjectRequest = {
        buyerId,
        projectId,
        reason,
        description: description.trim(),
        attachments: validAttachments.length > 0 ? validAttachments : undefined,
      };

      const response = await reportProject(reportData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        setError(response.error || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-orange-400 px-6 py-5 flex items-center justify-between relative overflow-hidden">
            {/* Background Pattern - Plus signs */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 18v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            <div className="relative z-10 flex items-center gap-4 flex-1">
              <div className="p-3 bg-amber-100 rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Report Project Issue</h2>
                <p className="text-white/80 text-sm mt-0.5 line-clamp-1">{projectTitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="relative z-10 text-white hover:text-white/80 p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {success ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted Successfully!</h3>
                <p className="text-gray-600">Thank you for reporting this issue. Our team will review it shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                    <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                    Reason for Reporting <span className="text-red-500">*</span>
                  </label>
                  {!isPurchased && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2.5">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-blue-700">
                        <span className="font-semibold text-blue-800">Note:</span> Since you haven't purchased this project, some report options are limited. You can report issues visible in the description, preview, or images.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {REPORT_REASONS.map((option) => (
                      <label
                        key={option.value}
                        className={`group flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                          reason === option.value
                            ? 'border-orange-400 bg-orange-50/50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="radio"
                            name="reason"
                            value={option.value}
                            checked={reason === option.value}
                            onChange={(e) => setReason(e.target.value)}
                            className="h-5 w-5 text-orange-500 focus:ring-orange-400 focus:ring-offset-0 border-2 border-gray-300 cursor-pointer"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500 mt-0.5">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                    <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></span>
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Please provide detailed information about the issue you encountered. Be as specific as possible to help us understand and resolve the problem quickly..."
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none transition-all ${
                      description.length > 0 && description.length < 10
                        ? 'border-red-300 bg-red-50'
                        : description.length >= 10
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                    }`}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs font-medium ${
                      description.length < 10
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {description.length >= 10 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {description.length} characters (minimum met)
                        </span>
                      ) : (
                        `${description.length}/10 characters minimum`
                      )}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                    <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></span>
                    Attachments (Optional)
                    <span className="text-xs font-normal text-gray-500 ml-2">Max 5 URLs</span>
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-3 flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Provide URLs to screenshots, error messages, or any other evidence that supports your report. Upload images to a service like imgur or use S3 URLs.</span>
                    </p>
                    <div className="space-y-3">
                      {attachments.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => handleAttachmentChange(index, e.target.value)}
                              placeholder="https://example.com/screenshot.png"
                              className={`w-full px-4 py-2.5 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                                url.trim() && !validateUrl(url)
                                  ? 'border-red-300 bg-red-50'
                                  : url.trim() && validateUrl(url)
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-gray-300'
                              }`}
                            />
                            {url && validateUrl(url) && (
                              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {attachments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAttachmentField(index)}
                              className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      {attachments.length < 5 && (
                        <button
                          type="button"
                          onClick={addAttachmentField}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-orange-600 hover:text-orange-700 font-medium text-sm border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Another Attachment URL ({attachments.length}/5)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportProjectModal;

