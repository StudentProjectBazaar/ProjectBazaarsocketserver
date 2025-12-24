import React, { useState, useEffect, useRef } from 'react';
import type { BuyerProject } from './BuyerProjectCard';
import OrangeCheckbox from './OrangeCheckbox';

interface DashboardFiltersProps {
    projects: BuyerProject[];
    onFilterChange: (filteredProjects: BuyerProject[]) => void;
}

type SortOption = 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'newest';

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ projects, onFilterChange }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 9000]);
    const [premiumFilter, setPremiumFilter] = useState<'all' | 'premium' | 'regular'>('all');
    const [hasDocumentation, setHasDocumentation] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('price-low');
    const [isOpen, setIsOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    // Close filter menu when clicking outside (mobile only)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Get unique categories
    const categories = Array.from(new Set(projects.map(p => p.category)));

    // Apply filters
    React.useEffect(() => {
        let filtered = [...projects];

        // Category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(p => selectedCategories.includes(p.category));
        }

        // Price range filter
        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Premium filter
        if (premiumFilter === 'premium') {
            filtered = filtered.filter(p => p.isPremium);
        } else if (premiumFilter === 'regular') {
            filtered = filtered.filter(p => !p.isPremium);
        }

        // Features filter
        if (hasDocumentation) {
            filtered = filtered.filter(p => p.hasDocumentation);
        }
        if (hasVideo) {
            filtered = filtered.filter(p => p.hasExecutionVideo);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name-asc':
                    return a.title.localeCompare(b.title);
                case 'name-desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        onFilterChange(filtered);
    }, [selectedCategories, priceRange, premiumFilter, hasDocumentation, hasVideo, sortOption, projects, onFilterChange]);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, 9000]);
        setPremiumFilter('all');
        setHasDocumentation(false);
        setHasVideo(false);
        setSortOption('price-low');
    };

    const hasActiveFilters = selectedCategories.length > 0 || 
        priceRange[0] > 0 || priceRange[1] < 9000 || 
        premiumFilter !== 'all' || 
        hasDocumentation || 
        hasVideo;

    return (
        <>
            {/* Mobile Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-4"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-medium text-gray-700">Filters</span>
                {hasActiveFilters && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {selectedCategories.length + (premiumFilter !== 'all' ? 1 : 0) + (hasDocumentation ? 1 : 0) + (hasVideo ? 1 : 0)}
                    </span>
                )}
            </button>

            {/* Filter Sidebar */}
            <div ref={filterRef} className={`${isOpen ? 'block' : 'hidden'} lg:block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit lg:sticky lg:top-4 z-10`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {/* Sort */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    >
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="name-desc">Name: Z to A</option>
                    </select>
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Categories</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories.map((category) => (
                            <label
                                key={category}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
                            >
                                <OrangeCheckbox
                                    checked={selectedCategories.includes(category)}
                                    onChange={(checked) => {
                                        if (checked && !selectedCategories.includes(category)) {
                                            setSelectedCategories(prev => [...prev, category]);
                                        } else if (!checked && selectedCategories.includes(category)) {
                                            setSelectedCategories(prev => prev.filter(c => c !== category));
                                        }
                                    }}
                                />
                                <span className="text-sm text-gray-700">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <div className="space-y-3">
                        <input
                            type="range"
                            min="0"
                            max="9000"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <input
                            type="range"
                            min="0"
                            max="9000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="0"
                                max="9000"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                            <input
                                type="number"
                                min="0"
                                max="9000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Premium Filter */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Project Type</label>
                    <div className="space-y-2">
                        {(['all', 'premium', 'regular'] as const).map((option) => (
                            <label
                                key={option}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="premium"
                                    checked={premiumFilter === option}
                                    onChange={() => setPremiumFilter(option)}
                                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 focus:ring-2"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                    {option === 'all' ? 'All Projects' : option === 'premium' ? 'Premium Only' : 'Regular Only'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Features</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                            <OrangeCheckbox
                                checked={hasDocumentation}
                                onChange={(checked) => setHasDocumentation(checked)}
                            />
                            <span className="text-sm text-gray-700">Has Documentation</span>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                            <OrangeCheckbox
                                checked={hasVideo}
                                onChange={(checked) => setHasVideo(checked)}
                            />
                            <span className="text-sm text-gray-700">Has Execution Video</span>
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardFilters;

