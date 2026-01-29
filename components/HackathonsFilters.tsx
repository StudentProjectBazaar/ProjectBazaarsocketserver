import React, { useState } from 'react';

interface HackathonsFiltersProps {
  statusFilter: 'all' | 'live' | 'upcoming';
  setStatusFilter: (filter: 'all' | 'live' | 'upcoming') => void;
  modeFilter: 'all' | 'Online' | 'Offline';
  setModeFilter: (filter: 'all' | 'Online' | 'Offline') => void;
  locationFilter: string[];
  setLocationFilter: (locations: string[]) => void;
  hackathons: any[];
}

const HackathonsFilters: React.FC<HackathonsFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  modeFilter,
  setModeFilter,
  locationFilter,
  setLocationFilter,
  hackathons,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    locations: false,
  });
  const [locationSearch, setLocationSearch] = useState('');

  // Extract unique locations from hackathons
  const allUniqueLocations = Array.from(
    new Set(hackathons.map(h => h.location).filter(Boolean))
  ).sort() as string[];

  // Filter locations based on search query
  const uniqueLocations = allUniqueLocations.filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Calculate active filter count (only based on actual data fields)
  const activeFilterCount = [
    statusFilter !== 'all' ? 1 : 0,
    modeFilter !== 'all' ? 1 : 0,
    locationFilter.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setStatusFilter('all');
    setModeFilter('all');
    setLocationFilter([]);
  };

  const toggleLocation = (location: string) => {
    const newLocations = locationFilter.includes(location)
      ? locationFilter.filter((l: string) => l !== location)
      : [...locationFilter, location];
    setLocationFilter(newLocations);
  };

  // Status options based on actual API data (status field)
  const statusOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'live', label: 'Live', icon: 'live' },
    { value: 'upcoming', label: 'Upcoming', icon: 'upcoming' },
  ];

  // Icon components - smaller and cleaner
  const LiveIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" width="12" height="12">
      <circle cx="12" cy="12" r="8" fill="currentColor"/>
    </svg>
  );

  const UpcomingIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="12" height="12">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const OnlineIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="12" height="12">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );

  const OfflineIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="12" height="12">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const AllIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} width="12" height="12">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status Filter - Compact Design */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-medium text-gray-700">Status</span>
          {statusFilter !== 'all' && (
            <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold">
              1
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map(option => {
            const isSelected = statusFilter === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? option.value === 'live'
                      ? 'bg-green-500 text-white border border-green-600 shadow-sm'
                      : option.value === 'upcoming'
                      ? 'bg-blue-500 text-white border border-blue-600 shadow-sm'
                      : 'bg-orange-500 text-white border border-orange-600 shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {option.value === 'live' && (
                  <LiveIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                )}
                {option.value === 'upcoming' && (
                  <UpcomingIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                )}
                {option.value === 'all' && (
                  <AllIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Type Filter - Compact Design */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-medium text-gray-700">Event Type</span>
          {modeFilter !== 'all' && (
            <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold">
              1
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Online', 'Offline'].map(type => {
            const isSelected = (type === 'All' && modeFilter === 'all') || modeFilter === type;
            return (
              <button
                key={type}
                onClick={() => setModeFilter(type === 'All' ? 'all' : type as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? type === 'Online'
                      ? 'bg-purple-500 text-white border border-purple-600 shadow-sm'
                      : type === 'Offline'
                      ? 'bg-orange-500 text-white border border-orange-600 shadow-sm'
                      : 'bg-orange-500 text-white border border-orange-600 shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {type === 'Online' && (
                  <OnlineIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                )}
                {type === 'Offline' && (
                  <OfflineIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                )}
                {type === 'All' && (
                  <AllIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                )}
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Locations Filter - Collapsible with checkboxes */}
      {uniqueLocations.length > 0 && (
        <div>
          <button
            onClick={() => setExpandedSections(prev => ({ ...prev, locations: !prev.locations }))}
            className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-700">Locations</span>
              {locationFilter.length > 0 && (
                <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                  {locationFilter.length}
                </span>
              )}
            </div>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                expandedSections.locations ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.locations && (
            <div className="mt-2 space-y-1.5">
              {/* Location Search Input */}
              <div className="relative">
                <svg 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {/* Location List */}
              <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                {uniqueLocations.length > 0 ? (
                  uniqueLocations.slice(0, 30).map(location => (
                    <label
                      key={location}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={locationFilter.includes(location)}
                        onChange={() => toggleLocation(location)}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="line-clamp-1">{location}</span>
                    </label>
                  ))
                ) : (
                  <p className="px-2 py-1.5 text-[10px] text-gray-400 text-center">
                    No locations found
                  </p>
                )}
                {uniqueLocations.length > 30 && (
                  <p className="px-2 py-1.5 text-[10px] text-gray-400">
                    +{uniqueLocations.length - 30} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HackathonsFilters;

