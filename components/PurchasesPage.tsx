import React, { useState, useMemo } from 'react';
import OrangeCheckbox from './OrangeCheckbox';

const purchasedProjects = [
    { id: 'purchase-1', title: 'Portfolio Template', category: 'Web Development', purchaseDate: '2024-06-20', price: 19.99, status: 'Completed' },
    { id: 'purchase-2', title: 'CI/CD Pipeline Automation', category: 'DevOps', purchaseDate: '2024-06-18', price: 69.99, status: 'Completed' },
    { id: 'purchase-3', title: 'Task Management Tool', category: 'Web Application', purchaseDate: '2024-05-30', price: 44.99, status: 'Completed' },
    { id: 'purchase-4', title: '2D Platformer Game', category: 'Game Development', purchaseDate: '2024-05-15', price: 39.99, status: 'Completed' },
];

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

type SortOption = 'none' | 'alphabetical' | 'reverse-alphabetical' | 'purchase-date' | 'price-high-low' | 'price-low-high';

type ViewMode = 'table' | 'grid';

const PurchasesPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('none');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<ViewMode>('table');

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = purchasedProjects.filter(project => {
            const query = searchQuery.toLowerCase();
            return (
                project.title.toLowerCase().includes(query) ||
                project.category.toLowerCase().includes(query) ||
                project.purchaseDate.includes(query)
            );
        });

        if (sortOption === 'alphabetical') {
            filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === 'reverse-alphabetical') {
            filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
        } else if (sortOption === 'purchase-date') {
            filtered = [...filtered].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
        } else if (sortOption === 'price-high-low') {
            filtered = [...filtered].sort((a, b) => b.price - a.price);
        } else if (sortOption === 'price-low-high') {
            filtered = [...filtered].sort((a, b) => a.price - b.price);
        }

        return filtered;
    }, [searchQuery, sortOption]);

    const handleExport = () => {
        // Export functionality can be implemented here
        if (selectedItems.size > 0) {
            console.log('Exporting selected purchases:', Array.from(selectedItems));
        } else {
            console.log('Exporting all purchases...');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(new Set(filteredAndSortedProjects.map(p => p.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedItems);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedItems(newSelected);
    };

    const isAllSelected = filteredAndSortedProjects.length > 0 && 
        filteredAndSortedProjects.every(p => selectedItems.has(p.id));
    const isIndeterminate = selectedItems.size > 0 && !isAllSelected;

    const sortOptions = [
        { value: 'none' as SortOption, label: 'No Sorting' },
        { value: 'alphabetical' as SortOption, label: 'Alphabetical', subtext: 'A → Z' },
        { value: 'reverse-alphabetical' as SortOption, label: 'Reverse Alphabetical', subtext: 'Z → A' },
        { value: 'purchase-date' as SortOption, label: 'Purchase Date', subtext: 'Latest → Oldest' },
        { value: 'price-high-low' as SortOption, label: 'Price', subtext: 'High → Low' },
        { value: 'price-low-high' as SortOption, label: 'Price', subtext: 'Low → High' },
    ];

    return (
        <div className="mt-8">
            {/* Filter and Sort Bar */}
            <div className="mb-4 flex justify-between items-center">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </span>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Search for name, email or"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* View Toggle, Export and Sort Buttons */}
                <div className="flex items-center space-x-3">
                    {/* View Toggle Buttons */}
                    <div className="flex items-center bg-orange-50 rounded-lg p-1 border border-orange-200">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all duration-200 ${
                                viewMode === 'table'
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-orange-600'
                            }`}
                            title="Table View"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all duration-200 ${
                                viewMode === 'grid'
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-orange-600'
                            }`}
                            title="Grid View"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className={`flex items-center px-4 py-2 border rounded-lg transition-all ${
                            selectedItems.size > 0
                                ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span className="text-sm font-medium">
                            {selectedItems.size > 0 ? `Export (${selectedItems.size})` : 'Export'}
                        </span>
                    </button>

                    {/* Sort By Button */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                                isSortDropdownOpen
                                    ? 'border-orange-500 bg-white'
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                            <span className="text-sm font-medium text-gray-700 mr-2">Sort by</span>
                            <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        {/* Sort Dropdown */}
                        {isSortDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsSortDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortOption(option.value);
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                                            >
                                                <div className="flex items-center">
                                                    {sortOption === option.value && (
                                                        <svg className="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                    {sortOption !== option.value && (
                                                        <div className="w-5 mr-2"></div>
                                                    )}
                                                    <span className="text-sm text-gray-700">{option.label}</span>
                                                </div>
                                                {option.subtext && (
                                                    <span className="text-xs text-gray-500">{option.subtext}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gradient-to-r from-orange-50 to-orange-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">
                                    <div className="flex items-center">
                                        <OrangeCheckbox
                                            checked={isAllSelected}
                                            indeterminate={isIndeterminate}
                                            onChange={handleSelectAll}
                                        />
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Project Title
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Purchase Date
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredAndSortedProjects.length > 0 ? (
                                filteredAndSortedProjects.map((project) => (
                                    <tr 
                                        key={project.id} 
                                        className={`hover:bg-orange-50/30 transition-colors ${
                                            selectedItems.has(project.id) ? 'bg-orange-50/50' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <OrangeCheckbox
                                                    checked={selectedItems.has(project.id)}
                                                    onChange={(checked) => handleSelectItem(project.id, checked)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{project.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium">
                                                {project.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {project.purchaseDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                ${project.price.toFixed(2)}
                                            </div>
                                        </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-xs shadow-sm hover:shadow-md">
                                            <DownloadIcon /> Download
                                        </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-gray-500 text-sm font-medium">No purchases found</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {searchQuery ? `No purchases match "${searchQuery}"` : 'You have no purchases yet'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Selected Items Info */}
                {selectedItems.size > 0 && (
                    <div className="px-6 py-4 bg-orange-50 border-t border-orange-100 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            <span className="font-semibold text-orange-600">{selectedItems.size}</span> item{selectedItems.size !== 1 ? 's' : ''} selected
                        </div>
                        <button
                            onClick={() => setSelectedItems(new Set())}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                            Clear selection
                        </button>
                    </div>
                )}
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        {/* Select All in Grid View */}
                        <div className="mb-4 flex items-center justify-between pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <OrangeCheckbox
                                    checked={isAllSelected}
                                    indeterminate={isIndeterminate}
                                    onChange={handleSelectAll}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {selectedItems.size > 0 
                                        ? `${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''} selected`
                                        : 'Select all'
                                    }
                                </span>
                            </div>
                            {selectedItems.size > 0 && (
                                <button
                                    onClick={() => setSelectedItems(new Set())}
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Clear selection
                                </button>
                            )}
                        </div>

                        {/* Grid Cards */}
                        {filteredAndSortedProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className={`bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                                            selectedItems.has(project.id)
                                                ? 'border-orange-500 bg-orange-50/30 shadow-md'
                                                : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <OrangeCheckbox
                                                    checked={selectedItems.has(project.id)}
                                                    onChange={(checked) => handleSelectItem(project.id, checked)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                                        {project.title}
                                                    </h3>
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium">
                                                        {project.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Purchase Date:</span>
                                                <span className="font-medium text-gray-900">{project.purchaseDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="text-lg font-bold text-orange-600">
                                                    ${project.price.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>

                                        <button className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-sm shadow-sm hover:shadow-md">
                                            <DownloadIcon /> Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="flex flex-col items-center">
                                    <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm font-medium">No purchases found</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {searchQuery ? `No purchases match "${searchQuery}"` : 'You have no purchases yet'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchasesPage;
