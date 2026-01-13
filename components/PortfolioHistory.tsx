import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';

const PORTFOLIO_API_ENDPOINT = 'https://tya60ig1pc.execute-api.ap-south-2.amazonaws.com/default/portfolio-generator';

// Template metadata for display
const TEMPLATE_INFO: Record<string, { name: string; thumbnail: string; color: string }> = {
  minimal: { name: 'Minimal', thumbnail: '📄', color: '#000000' },
  modern: { name: 'Modern Dark', thumbnail: '🌙', color: '#a78bfa' },
  professional: { name: 'Professional', thumbnail: '💼', color: '#2563eb' },
  creative: { name: 'Creative', thumbnail: '🎨', color: '#f59e0b' },
  developer: { name: 'Developer', thumbnail: '💻', color: '#00ff88' },
  elegant: { name: 'Elegant', thumbnail: '✨', color: '#d4af37' },
};

interface PortfolioItem {
  portfolioId: string;
  userId: string;
  name: string;
  title: string;
  templateId: string;
  liveUrl: string;
  fileName: string;
  createdAt: string;
  summary?: {
    skillCount: number;
    experienceCount: number;
    projectCount: number;
    educationCount: number;
  };
}

interface PortfolioHistoryProps {
  onSelectPortfolio?: (portfolio: PortfolioItem) => void;
  compact?: boolean;
}

const PortfolioHistory: React.FC<PortfolioHistoryProps> = ({ onSelectPortfolio, compact = false }) => {
  const { userId, isLoggedIn } = useAuth();
  const [history, setHistory] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, userId]);

  const fetchHistory = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(PORTFOLIO_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getPortfolioHistory',
          userId: userId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setHistory(result.history || []);
      } else {
        setError(result.error || 'Failed to load history');
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (portfolioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this portfolio from history?')) {
      return;
    }
    
    setDeletingId(portfolioId);
    
    try {
      const response = await fetch(PORTFOLIO_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deletePortfolio',
          userId: userId,
          portfolioId: portfolioId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setHistory(prev => prev.filter(p => p.portfolioId !== portfolioId));
      } else {
        alert('Failed to delete portfolio');
      }
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      alert('Failed to delete portfolio');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-[#16161f] rounded-2xl border border-white/5 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-violet-500/20 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Sign in to view history</h3>
        <p className="text-gray-500 text-sm">Your portfolio generation history will appear here after you sign in.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#16161f] rounded-2xl border border-white/5 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Loading history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#16161f] rounded-2xl border border-white/5 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Error loading history</h3>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-[#16161f] rounded-2xl border border-white/5 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">📁</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No portfolios yet</h3>
        <p className="text-gray-500 text-sm">Your generated portfolios will appear here.</p>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'bg-[#16161f] rounded-2xl border border-white/5 p-6'}>
      {!compact && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Portfolios</h2>
          <span className="text-sm text-gray-500">{history.length} portfolio{history.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        {history.map((portfolio) => {
          const template = TEMPLATE_INFO[portfolio.templateId] || TEMPLATE_INFO.modern;
          
          return (
            <div
              key={portfolio.portfolioId}
              onClick={() => onSelectPortfolio?.(portfolio)}
              className={`group relative bg-[#0a0a0f] rounded-xl border border-white/5 p-5 transition-all hover:border-violet-500/30 ${
                onSelectPortfolio ? 'cursor-pointer' : ''
              }`}
            >
              {/* Template Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.thumbnail}</span>
                  <span 
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: `${template.color}20`, color: template.color }}
                  >
                    {template.name}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => copyToClipboard(portfolio.liveUrl, e)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <a
                    href={portfolio.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Open Portfolio"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={(e) => handleDelete(portfolio.portfolioId, e)}
                    disabled={deletingId === portfolio.portfolioId}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    {deletingId === portfolio.portfolioId ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Portfolio Info */}
              <h3 className="font-semibold text-white mb-1 truncate">{portfolio.name}</h3>
              {portfolio.title && (
                <p className="text-sm text-gray-400 mb-3 truncate">{portfolio.title}</p>
              )}
              
              {/* Stats */}
              {portfolio.summary && (
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                  <span>{portfolio.summary.skillCount} skills</span>
                  <span>{portfolio.summary.experienceCount} exp</span>
                  <span>{portfolio.summary.projectCount} projects</span>
                </div>
              )}
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-gray-500">{formatDate(portfolio.createdAt)}</span>
                <a
                  href={portfolio.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  View Live →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioHistory;
