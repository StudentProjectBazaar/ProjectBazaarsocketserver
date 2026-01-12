import React, { useState, useEffect } from 'react';
import type { Bid } from '../types/bids';
import { getBidsByProjectId } from '../services/bidsService';

interface ViewBidsProps {
  projectId: string;
  isProjectOwner?: boolean;
}

const ViewBids: React.FC<ViewBidsProps> = ({ projectId, isProjectOwner = false }) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadBids = () => {
      const projectBids = getBidsByProjectId(projectId);
      // Sort by submission date (newest first)
      projectBids.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setBids(projectBids);
      setLoading(false);
    };

    loadBids();

    // Refresh bids every 2 seconds to catch new submissions
    const interval = setInterval(loadBids, 2000);
    return () => clearInterval(interval);
  }, [projectId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    const statusText = {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };

    const statusClass = statusColors[status as keyof typeof statusColors] || statusColors.pending;
    const text = statusText[status as keyof typeof statusText] || 'Pending';

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
        {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading proposals...</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No proposals yet</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          Be the first to submit a proposal for this project
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Proposals ({bids.length})
        </h2>
      </div>

      {bids.map((bid) => (
        <div
          key={bid.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {bid.freelancerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {bid.freelancerName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {bid.freelancerEmail}
                      </div>
                    </div>
                  </div>
                  {isProjectOwner && getStatusBadge(bid.status)}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {bid.currency}${bid.bidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Delivery in {bid.deliveryTime} {bid.deliveryTimeUnit}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Proposal</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {bid.proposal}
                </p>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Submitted {formatDate(bid.submittedAt)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewBids;

