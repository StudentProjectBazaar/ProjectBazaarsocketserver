import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { BrowseProject } from '../types/browse';
import { useAuth } from '../App';
import { saveBidAsync, hasFreelancerBidOnProjectAsync } from '../services/bidsService';
import { getAllBidRequestProjects } from '../services/bidRequestProjectsApi';
import type { BidFormData } from '../types/bids';

// API endpoint for fetching owner profiles
const GET_USER_ENDPOINT = 'https://knb5lt8to2.execute-api.ap-south-2.amazonaws.com/default/Get_User_By_ID';

type SortOption = 'latest' | 'budget-high-low';
type ProjectTypeFilter = 'all' | 'fixed' | 'hourly';

interface BrowseProjectsContentProps {
  // No props needed for now
}

export const BrowseProjectsContent: React.FC<BrowseProjectsContentProps> = () => {
  const { userId, userEmail } = useAuth();
  const [projects, setProjects] = useState<BrowseProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectType, setProjectType] = useState<ProjectTypeFilter>('all');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 50000]);
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [receiveAlerts, setReceiveAlerts] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projectType: true,
    budget: true
  });
  
  // Bid modal state
  const [selectedProject, setSelectedProject] = useState<BrowseProject | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidFormData, setBidFormData] = useState<BidFormData>({
    bidAmount: 0,
    currency: 'USD',
    deliveryTime: 7,
    deliveryTimeUnit: 'days',
    proposal: ''
  });
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [ownerProfileCache, setOwnerProfileCache] = useState<Map<string, { name?: string; profilePicture?: string }>>(new Map());

  // Fetch owner profile
  const fetchOwnerProfile = useCallback(async (ownerId: string) => {
    if (ownerProfileCache.has(ownerId)) {
      return ownerProfileCache.get(ownerId);
    }
    
    try {
      const response = await fetch(GET_USER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: ownerId }),
      });
      
      const data = await response.json();
      const user = data.data || data.user || data;
      
      if (user && data.success !== false) {
        const profile = {
          name: user.fullName || user.name || undefined,
          profilePicture: user.profilePictureUrl || undefined,
        };
        
        setOwnerProfileCache(prev => new Map(prev).set(ownerId, profile));
        return profile;
      }
    } catch (err) {
      console.error('Error fetching owner profile:', err);
    }
    return undefined;
  }, [ownerProfileCache]);

  // Fetch bid request projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch bid request projects (job postings by buyers)
        const bidRequestProjects = await getAllBidRequestProjects();
        
        if (bidRequestProjects && bidRequestProjects.length > 0) {
          setProjects(bidRequestProjects);
          
          // Fetch owner profiles for all projects
          const uniqueOwnerIds = [...new Set(bidRequestProjects.map(p => p.ownerId).filter(Boolean))];
          uniqueOwnerIds.forEach(ownerId => {
            fetchOwnerProfile(ownerId).then(profile => {
              if (profile) {
                setProjects(prev => prev.map(p => 
                  p.ownerId === ownerId 
                    ? { ...p, ownerName: profile.name, ownerProfilePicture: profile.profilePicture }
                    : p
                ));
              }
            });
          });
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error('Error fetching bid request projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [fetchOwnerProfile]);

  // Handle opening bid modal
  const handleOpenBidModal = async (project: BrowseProject) => {
    if (!userId) {
      alert('Please login to place a bid');
      return;
    }
    
    // Check if user already bid on this project
    const hasBid = await hasFreelancerBidOnProjectAsync(userId, project.id);
    if (hasBid) {
      alert('You have already placed a bid on this project');
      return;
    }
    
    setSelectedProject(project);
    setBidFormData({
      bidAmount: project.budget.min,
      currency: project.budget.currency,
      deliveryTime: 7,
      deliveryTimeUnit: 'days',
      proposal: ''
    });
    setBidError(null);
    setBidSuccess(false);
    setShowBidModal(true);
  };

  // Handle bid submission
  const handleSubmitBid = async () => {
    if (!selectedProject || !userId || !userEmail) {
      setBidError('Please login to place a bid');
      return;
    }
    
    if (!bidFormData.proposal.trim()) {
      setBidError('Please write a proposal');
      return;
    }
    
    if (bidFormData.bidAmount <= 0) {
      setBidError('Please enter a valid bid amount');
      return;
    }
    
    setIsSubmittingBid(true);
    setBidError(null);
    
    try {
      const result = await saveBidAsync(
        bidFormData,
        selectedProject.id,
        userId,
        userEmail.split('@')[0],
        userEmail
      );
      
      if (result.success) {
        setBidSuccess(true);
        // Update bid count locally
        setProjects(prev => prev.map(p => 
          p.id === selectedProject.id 
            ? { ...p, bidsCount: p.bidsCount + 1 }
            : p
        ));
        setTimeout(() => {
          setShowBidModal(false);
          setBidSuccess(false);
        }, 2000);
      } else {
        setBidError(result.error || 'Failed to submit bid');
      }
    } catch (err) {
      setBidError('An error occurred while submitting your bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // Calculate budget range from projects
  const { minBudget, maxBudget } = useMemo(() => {
    if (projects.length === 0) return { minBudget: 0, maxBudget: 10000 };
    const budgets = projects.flatMap(p => [p.budget.min, p.budget.max]);
    return {
      minBudget: Math.floor(Math.min(...budgets)),
      maxBudget: Math.ceil(Math.max(...budgets))
    };
  }, [projects]);

  // Update budgetRange when projects are loaded and min/max change
  useEffect(() => {
    if (projects.length > 0) {
      setBudgetRange([minBudget, maxBudget]);
    }
  }, [minBudget, maxBudget, projects.length]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Project type filter
    if (projectType !== 'all') {
      filtered = filtered.filter(p => p.type === projectType);
    }

    // Budget filter
    filtered = filtered.filter(p => {
      const projectMax = p.budget.max;
      return projectMax >= budgetRange[0] && p.budget.min <= budgetRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'budget-high-low':
          return b.budget.max - a.budget.max;
        case 'latest':
        default:
          // Sort by posted time (most recent first)
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      }
    });

    return filtered;
  }, [projects, searchQuery, projectType, budgetRange, sortOption]);

  const clearFilters = () => {
    setProjectType('all');
    setBudgetRange([minBudget, maxBudget]);
    setSearchQuery('');
    setSortOption('latest');
  };

  const hasActiveFilters = projectType !== 'all' || budgetRange[0] > minBudget || budgetRange[1] < maxBudget;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const minPercent = ((budgetRange[0] - minBudget) / (maxBudget - minBudget)) * 100;
  const maxPercent = ((budgetRange[1] - minBudget) / (maxBudget - minBudget)) * 100;

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
        <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-500 text-lg font-medium mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for projects"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 pl-14 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:text-gray-100 text-lg"
          />
          <svg
            className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-80">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg h-fit lg:sticky lg:top-4 z-10 transition-all duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-semibold transition-colors duration-200 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Sort By</label>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="latest">Latest</option>
                  <option value="budget-high-low">Budget High → Low</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Project Type */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('projectType')}
                className="w-full flex items-center justify-between mb-3 group"
              >
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 cursor-pointer">
                  Project Type
                </label>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${expandedSections.projectType ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.projectType && (
                <div className="space-y-2">
                  {(['all', 'fixed', 'hourly'] as ProjectTypeFilter[]).map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200"
                    >
                      <input
                        type="radio"
                        name="projectType"
                        value={type}
                        checked={projectType === type}
                        onChange={(e) => setProjectType(e.target.value as ProjectTypeFilter)}
                        className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium capitalize">
                        {type === 'all' ? 'All Projects' : type === 'fixed' ? 'Fixed Price' : 'Hourly'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Range */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('budget')}
                className="w-full flex items-center justify-between mb-3 group"
              >
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 cursor-pointer">
                  Budget Range
                </label>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${expandedSections.budget ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.budget && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="relative h-8 py-3">
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full transform -translate-y-1/2"></div>
                    <div
                      className="absolute top-1/2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transform -translate-y-1/2"
                      style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                    ></div>
                    <input
                      type="range"
                      min={minBudget}
                      max={maxBudget}
                      value={budgetRange[0]}
                      onChange={(e) => setBudgetRange([Number(e.target.value), budgetRange[1]])}
                      className="absolute top-0 left-0 w-full h-8 bg-transparent appearance-none cursor-pointer z-30"
                    />
                    <input
                      type="range"
                      min={minBudget}
                      max={maxBudget}
                      value={budgetRange[1]}
                      onChange={(e) => setBudgetRange([budgetRange[0], Number(e.target.value)])}
                      className="absolute top-0 left-0 w-full h-8 bg-transparent appearance-none cursor-pointer z-20"
                    />
                    <style>{`
                      input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #f97316;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      }
                      input[type="range"]::-moz-range-thumb {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #f97316;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      }
                    `}</style>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min</label>
                      <input
                        type="number"
                        min={minBudget}
                        max={maxBudget}
                        value={budgetRange[0]}
                        onChange={(e) => {
                          const val = Math.max(minBudget, Math.min(maxBudget, Number(e.target.value)));
                          setBudgetRange([val, budgetRange[1]]);
                        }}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max</label>
                      <input
                        type="number"
                        min={minBudget}
                        max={maxBudget}
                        value={budgetRange[1]}
                        onChange={(e) => {
                          const val = Math.max(minBudget, Math.min(maxBudget, Number(e.target.value)));
                          setBudgetRange([budgetRange[0], val]);
                        }}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Receive Alerts Toggle */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={receiveAlerts}
                  onChange={(e) => setReceiveAlerts(e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Receive alerts for this search
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredAndSortedProjects.length}</span> project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
          </div>

          {filteredAndSortedProjects.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left Content */}
                    <div className="flex-1">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {truncateDescription(project.description)}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Requirement Owner Info */}
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center overflow-hidden">
                          {project.ownerProfilePicture ? (
                            <img 
                              src={project.ownerProfilePicture} 
                              alt={project.ownerName || 'Owner'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">
                              {(project.ownerName || project.ownerEmail || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Posted by</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {project.ownerName || project.ownerEmail?.split('@')[0] || 'Anonymous'}
                          </p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{project.bidsCount} {project.bidsCount === 1 ? 'bid' : 'bids'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{project.postedTimeAgo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex flex-col items-end gap-4 md:min-w-[200px]">
                      {/* Budget */}
                      <div className="text-right">
                        {project.type === 'fixed' ? (
                          <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${project.budget.min.toLocaleString()}
                              {project.budget.max !== project.budget.min && ` - $${project.budget.max.toLocaleString()}`}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Fixed Price</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${project.budget.min}/{project.budget.currency}/hr
                              {project.budget.max !== project.budget.min && ` - $${project.budget.max}/${project.budget.currency}/hr`}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Hourly</div>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <button 
                        onClick={() => handleOpenBidModal(project)}
                        className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 whitespace-nowrap"
                      >
                        {project.bidsCount === 0 ? 'Be First to Bid' : 'Place Bid'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No projects found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Place Your Bid</h2>
                <button 
                  onClick={() => setShowBidModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Project Info */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                {selectedProject.thumbnailUrl && (
                  <img 
                    src={selectedProject.thumbnailUrl} 
                    alt={selectedProject.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedProject.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {selectedProject.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProject.skills.slice(0, 4).map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ${selectedProject.budget.min.toLocaleString()}
                    {selectedProject.budget.max !== selectedProject.budget.min && 
                      ` - $${selectedProject.budget.max.toLocaleString()}`
                    }
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedProject.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
                  </p>
                </div>
              </div>

              {/* Requirement Owner */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Requirement Owner</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center overflow-hidden">
                    {selectedProject.ownerProfilePicture ? (
                      <img 
                        src={selectedProject.ownerProfilePicture} 
                        alt={selectedProject.ownerName || 'Owner'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">
                        {(selectedProject.ownerName || selectedProject.ownerEmail || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedProject.ownerName || selectedProject.ownerEmail?.split('@')[0] || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedProject.ownerEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bid Form */}
            <div className="p-6 space-y-5">
              {bidSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Bid Submitted!</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your bid has been successfully submitted to the project owner.</p>
                </div>
              ) : (
                <>
                  {/* Bid Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Bid Amount ({selectedProject.budget.currency})
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={bidFormData.bidAmount}
                        onChange={(e) => setBidFormData(prev => ({ ...prev, bidAmount: Number(e.target.value) }))}
                        min={0}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Enter your bid amount"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Project budget: ${selectedProject.budget.min.toLocaleString()} - ${selectedProject.budget.max.toLocaleString()}
                    </p>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Time
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={bidFormData.deliveryTime}
                        onChange={(e) => setBidFormData(prev => ({ ...prev, deliveryTime: Number(e.target.value) }))}
                        min={1}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Time"
                      />
                      <select
                        value={bidFormData.deliveryTimeUnit}
                        onChange={(e) => setBidFormData(prev => ({ ...prev, deliveryTimeUnit: e.target.value as 'hours' | 'days' | 'weeks' | 'months' }))}
                        className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>

                  {/* Proposal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Proposal
                    </label>
                    <textarea
                      value={bidFormData.proposal}
                      onChange={(e) => setBidFormData(prev => ({ ...prev, proposal: e.target.value }))}
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
                      placeholder="Describe why you're the best fit for this project, your relevant experience, and how you plan to approach this work..."
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {bidFormData.proposal.length}/1000 characters
                    </p>
                  </div>

                  {/* Error Message */}
                  {bidError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{bidError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowBidModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitBid}
                      disabled={isSubmittingBid}
                      className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingBid ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Bid'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

