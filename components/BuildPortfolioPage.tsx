import React, { useState, useCallback } from 'react';
import { useNavigation, useAuth } from '../App';

// API Endpoint for portfolio generation
// Local development: http://localhost:3001/generate-portfolio
// Production: Your Lambda API Gateway URL
const PORTFOLIO_API_ENDPOINT = 'http://localhost:3001/generate-portfolio';

// Demo mode - set to false to use real backend, true for demo simulation
const DEMO_MODE = true;

interface PortfolioStatus {
  stage: 'idle' | 'uploading' | 'parsing' | 'extracting' | 'building' | 'deploying' | 'complete' | 'error';
  message: string;
  progress: number;
}

interface DeploymentResult {
  success: boolean;
  liveUrl?: string;
  previewUrl?: string;
  error?: string;
}

interface BuildPortfolioPageProps {
  embedded?: boolean;
}

const BuildPortfolioPage: React.FC<BuildPortfolioPageProps> = ({ embedded = false }) => {
  const { navigateTo } = useNavigation();
  const { isLoggedIn, userId, userEmail } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<PortfolioStatus>({
    stage: 'idle',
    message: 'Upload your resume to get started',
    progress: 0
  });
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  const stages = [
    { id: 'uploading', label: 'Uploading Resume', icon: '📤' },
    { id: 'parsing', label: 'Parsing Document', icon: '📄' },
    { id: 'extracting', label: 'Extracting Data with AI', icon: '🤖' },
    { id: 'building', label: 'Building Portfolio', icon: '🏗️' },
    { id: 'deploying', label: 'Deploying to Cloud', icon: '🚀' },
    { id: 'complete', label: 'Portfolio Live!', icon: '✅' },
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
        setDeploymentResult(null);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
        setDeploymentResult(null);
      }
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document (.pdf, .docx, .doc)');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const updateStatus = (stage: PortfolioStatus['stage'], message: string, progress: number) => {
    setStatus({ stage, message, progress });
  };

  const buildPortfolio = async () => {
    if (!file) return;

    try {
      // Stage 1: Upload
      updateStatus('uploading', 'Uploading your resume...', 10);
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await simulateDelay(800);

      // Stage 2: Parsing
      updateStatus('parsing', 'Parsing your resume document...', 25);
      await simulateDelay(1000);

      // Stage 3: AI Extraction
      updateStatus('extracting', 'AI is extracting your professional data...', 45);
      await simulateDelay(1500);

      // DEMO MODE: Simulate the flow without backend
      if (DEMO_MODE) {
        updateStatus('building', 'Building your portfolio website...', 65);
        await simulateDelay(1500);

        updateStatus('deploying', 'Deploying to Vercel...', 85);
        await simulateDelay(1200);

        // Return the previously deployed demo URL
        const demoUrl = 'https://dist-six-kappa-15.vercel.app';
        
        updateStatus('complete', 'Your portfolio is live!', 100);
        setDeploymentResult({
          success: true,
          liveUrl: demoUrl,
          previewUrl: demoUrl,
        });
        return;
      }

      // PRODUCTION MODE: Call the Lambda API
      const response = await fetch(PORTFOLIO_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generatePortfolio',
          userId: userId || `guest_${Date.now()}`,
          userEmail: userEmail || 'guest@example.com',
          fileName: file.name,
          fileType: file.type,
          fileContent: base64,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming progress updates if available
      const result = await response.json();

      if (result.stage === 'building') {
        updateStatus('building', 'Building your portfolio website...', 65);
        await simulateDelay(1000);
      }

      if (result.stage === 'deploying' || result.success) {
        updateStatus('deploying', 'Deploying to Vercel...', 85);
        await simulateDelay(800);
      }

      if (result.success && result.liveUrl) {
        updateStatus('complete', 'Your portfolio is live!', 100);
        setDeploymentResult({
          success: true,
          liveUrl: result.liveUrl,
          previewUrl: result.previewUrl,
        });
      } else {
        throw new Error(result.error || 'Deployment failed');
      }

    } catch (error) {
      console.error('Portfolio generation error:', error);
      updateStatus('error', error instanceof Error ? error.message : 'An error occurred', 0);
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during portfolio generation',
      });
    }
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const resetForm = () => {
    setFile(null);
    setStatus({ stage: 'idle', message: 'Upload your resume to get started', progress: 0 });
    setDeploymentResult(null);
  };

  const getStageIndex = () => {
    return stages.findIndex(s => s.id === status.stage);
  };

  return (
    <div className={`${embedded ? 'min-h-full' : 'min-h-screen'} bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] text-white ${embedded ? 'rounded-2xl' : ''}`}>
      {/* Header - Only show when not embedded */}
      {!embedded && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button 
              onClick={() => navigateTo('home')} 
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold">PB</span>
              </div>
              <span className="text-xl font-bold group-hover:text-violet-400 transition-colors">
                ProjectBazaar
              </span>
            </button>
            
            <nav className="flex items-center gap-4">
              {isLoggedIn ? (
                <button 
                  onClick={() => navigateTo('dashboard')}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => navigateTo('auth')}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      <main className={`${embedded ? 'py-8' : 'pt-24 pb-16'} px-6`}>
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-sm text-violet-400">AI-Powered Portfolio Builder</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Build Your <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Portfolio</span>
              <br />in Seconds
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Upload your resume and let AI create a stunning, professional portfolio website. 
              Automatically deployed and ready to share.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-[#16161f] rounded-3xl border border-white/5 overflow-hidden">
            {/* Upload Section */}
            {status.stage === 'idle' && !deploymentResult && (
              <div className="p-8">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-violet-500 bg-violet-500/10' 
                      : file 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-white">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-violet-500/20 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-white">
                          Drag & drop your resume here
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          or click to browse • PDF, DOC, DOCX (max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Build Button */}
                <button
                  onClick={buildPortfolio}
                  disabled={!file}
                  className={`w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    file
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {file ? '🚀 Build My Portfolio' : 'Upload Resume to Continue'}
                </button>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                  {[
                    { icon: '⚡', label: 'Instant', desc: 'Ready in 30 seconds' },
                    { icon: '🎨', label: 'Beautiful', desc: 'Modern design' },
                    { icon: '🔗', label: 'Shareable', desc: 'Live URL included' },
                  ].map((feature) => (
                    <div key={feature.label} className="text-center">
                      <div className="text-2xl mb-2">{feature.icon}</div>
                      <p className="font-medium text-white">{feature.label}</p>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Section */}
            {status.stage !== 'idle' && status.stage !== 'complete' && status.stage !== 'error' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{status.message}</h2>
                  <p className="text-gray-500">Please wait while we create your portfolio...</p>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-8">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                  <span className="absolute right-0 -top-6 text-sm text-gray-500">{status.progress}%</span>
                </div>

                {/* Stage Indicators */}
                <div className="space-y-3">
                  {stages.slice(0, -1).map((stage, index) => {
                    const currentIndex = getStageIndex();
                    const isComplete = currentIndex > index;
                    const isCurrent = currentIndex === index;
                    
                    return (
                      <div 
                        key={stage.id}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          isCurrent ? 'bg-violet-500/10 border border-violet-500/30' :
                          isComplete ? 'bg-green-500/5' : 'opacity-40'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isComplete ? 'bg-green-500/20' : isCurrent ? 'bg-violet-500/20' : 'bg-gray-800'
                        }`}>
                          {isComplete ? (
                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-lg">{stage.icon}</span>
                          )}
                        </div>
                        <span className={`font-medium ${isComplete ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-500'}`}>
                          {stage.label}
                        </span>
                        {isCurrent && (
                          <div className="ml-auto flex gap-1">
                            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Success Section */}
            {status.stage === 'complete' && deploymentResult?.success && (
              <div className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-2">Your Portfolio is Live! 🎉</h2>
                <p className="text-gray-400 mb-8">Share your new professional portfolio with the world</p>

                {/* Live URL */}
                <div className="bg-[#0a0a0f] rounded-2xl p-6 mb-6">
                  <p className="text-sm text-gray-500 mb-2">Your Portfolio URL</p>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-gray-800/50 px-4 py-3 rounded-xl text-violet-400 font-mono text-sm overflow-hidden text-ellipsis">
                      {deploymentResult.liveUrl}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(deploymentResult.liveUrl || '')}
                      className="p-3 bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors"
                      title="Copy URL"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <a
                    href={deploymentResult.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Portfolio
                  </a>
                  <button
                    onClick={resetForm}
                    className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Build Another
                  </button>
                </div>

                {/* Share Options */}
                <div className="mt-8 pt-8 border-t border-white/5">
                  <p className="text-sm text-gray-500 mb-4">Share your portfolio</p>
                  <div className="flex justify-center gap-4">
                    {[
                      { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
                      { name: 'Twitter', icon: '🐦', color: 'bg-sky-500' },
                      { name: 'Email', icon: '📧', color: 'bg-gray-600' },
                    ].map((social) => (
                      <button
                        key={social.name}
                        className={`${social.color} hover:opacity-80 px-4 py-2 rounded-lg font-medium transition-opacity flex items-center gap-2`}
                      >
                        <span>{social.icon}</span>
                        {social.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Section */}
            {status.stage === 'error' && (
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-3xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
                <p className="text-gray-400 mb-6">{deploymentResult?.error || status.message}</p>
                
                <button
                  onClick={resetForm}
                  className="px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: '📝',
                title: 'Smart Parsing',
                description: 'Our AI reads your resume and extracts skills, experience, education, and projects automatically.'
              },
              {
                icon: '🎨',
                title: 'Beautiful Design',
                description: 'Your portfolio gets a modern, responsive design that looks great on any device.'
              },
              {
                icon: '⚡',
                title: 'Instant Deploy',
                description: 'Your portfolio is automatically deployed to Vercel with a shareable URL.'
              },
            ].map((card) => (
              <div key={card.title} className="bg-[#16161f] rounded-2xl p-6 border border-white/5">
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuildPortfolioPage;

