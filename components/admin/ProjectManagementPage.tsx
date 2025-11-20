import React, { useState } from 'react';
import type { BuyerProject } from '../BuyerProjectCard';

interface PendingProject extends BuyerProject {
    sellerEmail: string;
    sellerName: string;
    sellerId: string;
    uploadedDate: string;
    status: 'pending' | 'in-review' | 'active' | 'disabled' | 'rejected';
}

interface ProjectManagementPageProps {
    onViewUser?: (user: { id: string; name: string; email: string }) => void;
    onViewProjectDetails?: (project: PendingProject) => void;
}

const ProjectManagementPage: React.FC<ProjectManagementPageProps> = ({ onViewUser, onViewProjectDetails }) => {
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [projects, setProjects] = useState<PendingProject[]>([
        {
            id: 'proj-pending-1',
            imageUrl: 'https://images.unsplash.com/photo-1534237693998-0c6218f200b3?q=80&w=2070&auto=format&fit=crop',
            category: 'Web Development',
            title: 'E-commerce Platform',
            description: 'A full-stack e-commerce solution built with MERN stack, including payment integration.',
            tags: ['React', 'Node.js', 'MongoDB'],
            price: 49.99,
            isPremium: true,
            hasDocumentation: true,
            hasExecutionVideo: false,
            sellerEmail: 'seller1@example.com',
            sellerName: 'John Doe',
            sellerId: 'seller-1',
            uploadedDate: '2024-11-15',
            status: 'pending',
        },
        {
            id: 'proj-pending-2',
            imageUrl: 'https://images.unsplash.com/photo-1611162617213-6d22e4f13374?q=80&w=1974&auto=format&fit=crop',
            category: 'Mobile App',
            title: 'Social Media App',
            description: 'Feature-rich social media app clone using React Native and Firebase.',
            tags: ['React Native', 'Firebase'],
            price: 59.99,
            hasDocumentation: true,
            hasExecutionVideo: true,
            sellerEmail: 'seller2@example.com',
            sellerName: 'Jane Smith',
            sellerId: 'seller-2',
            uploadedDate: '2024-11-16',
            status: 'in-review',
        },
        {
            id: 'proj-pending-3',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
            category: 'Data Science',
            title: 'Sales Prediction AI',
            description: 'A machine learning model to predict future sales data with high accuracy.',
            tags: ['Python', 'Scikit-learn', 'Pandas'],
            price: 79.99,
            isPremium: true,
            hasExecutionVideo: true,
            sellerEmail: 'seller3@example.com',
            sellerName: 'Bob Johnson',
            sellerId: 'seller-3',
            uploadedDate: '2024-11-17',
            status: 'active',
        },
    ]);

    const handleApprove = (projectId: string) => {
        setProjects(projects.map(p => 
            p.id === projectId ? { ...p, status: 'active' as const } : p
        ));
    };

    const handleReject = (projectId: string) => {
        setProjects(projects.map(p => 
            p.id === projectId ? { ...p, status: 'rejected' as const } : p
        ));
    };

    const handleDisable = (projectId: string) => {
        setProjects(projects.map(p => 
            p.id === projectId ? { ...p, status: 'disabled' as const } : p
        ));
    };

    const handleEnable = (projectId: string) => {
        setProjects(projects.map(p => 
            p.id === projectId ? { ...p, status: 'active' as const } : p
        ));
    };

    const handleViewUser = (project: PendingProject) => {
        if (onViewUser) {
            onViewUser({
                id: project.sellerId,
                name: project.sellerName,
                email: project.sellerEmail,
            });
        }
    };

    const pendingProjects = projects.filter(p => p.status === 'pending');
    const inReviewProjects = projects.filter(p => p.status === 'in-review');
    const activeProjects = projects.filter(p => p.status === 'active');
    const disabledProjects = projects.filter(p => p.status === 'disabled');
    const rejectedProjects = projects.filter(p => p.status === 'rejected');

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-700">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{pendingProjects.length}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700">In Review</p>
                    <p className="text-2xl font-bold text-blue-900">{inReviewProjects.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-700">Active</p>
                    <p className="text-2xl font-bold text-green-900">{activeProjects.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700">Disabled</p>
                    <p className="text-2xl font-bold text-gray-900">{disabledProjects.length}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-red-700">Rejected</p>
                    <p className="text-2xl font-bold text-red-900">{rejectedProjects.length}</p>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            viewMode === 'table' 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Table View
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            viewMode === 'grid' 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Grid View
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'table' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-3/4">Project Name</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider w-1/4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-5 align-top">
                                            <div className="flex items-start gap-4">
                                                <img 
                                                    className="h-20 w-20 rounded-xl object-cover shadow-md flex-shrink-0" 
                                                    src={project.imageUrl} 
                                                    alt={project.title} 
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${
                                                            project.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                                                            project.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                                            project.status === 'in-review' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                            project.status === 'disabled' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                                                            'bg-yellow-100 text-yellow-800 border-yellow-300'
                                                        }`}>
                                                            {project.status === 'active' ? 'Active' :
                                                             project.status === 'in-review' ? 'In Review' :
                                                             project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                        </span>
                                                        {project.isPremium && (
                                                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center gap-1 whitespace-nowrap">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                PREMIUM
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{project.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1.5">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <button
                                                                onClick={() => handleViewUser(project)}
                                                                className="hover:text-orange-600 transition-colors font-medium"
                                                            >
                                                                {project.sellerName}
                                                            </button>
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 font-medium">
                                                            {project.category}
                                                        </span>
                                                        <span className="font-semibold text-gray-700">${project.price.toFixed(2)}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span>Uploaded: {project.uploadedDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-top text-right">
                                            <div className="flex flex-col gap-2 items-end justify-start">
                                                <button
                                                    onClick={() => onViewProjectDetails?.(project)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold text-sm shadow-md hover:shadow-lg whitespace-nowrap"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    More Details
                                                </button>
                                                {project.status === 'pending' && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApprove(project.id)}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg whitespace-nowrap"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(project.id)}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg whitespace-nowrap"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {project.status === 'in-review' && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApprove(project.id)}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg whitespace-nowrap"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(project.id)}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg whitespace-nowrap"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {project.status === 'active' && (
                                                    <button
                                                        onClick={() => handleDisable(project.id)}
                                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg whitespace-nowrap"
                                                    >
                                                        Disable
                                                    </button>
                                                )}
                                                {project.status === 'disabled' && (
                                                    <button
                                                        onClick={() => handleEnable(project.id)}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg whitespace-nowrap"
                                                    >
                                                        Enable
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <img src={project.imageUrl} alt={project.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                        {project.category}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                                        project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        project.status === 'in-review' ? 'bg-blue-100 text-blue-800' :
                                        project.status === 'disabled' ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {project.status === 'active' ? 'Active' :
                                         project.status === 'in-review' ? 'In Review' :
                                         project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                                <div className="mb-4">
                                    <button
                                        onClick={() => handleViewUser(project)}
                                        className="text-left hover:text-orange-600 transition-colors group"
                                    >
                                        <p className="text-sm font-medium text-gray-500 group-hover:text-orange-600">Seller: {project.sellerName}</p>
                                        <p className="text-xs text-gray-400">{project.sellerEmail}</p>
                                    </button>
                                    <p className="text-xs text-gray-400 mt-1">Uploaded: {project.uploadedDate}</p>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xl font-bold text-orange-600">${project.price.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => onViewProjectDetails?.(project)}
                                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold mb-2"
                                >
                                    More Details
                                </button>
                                {project.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(project.id)}
                                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(project.id)}
                                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                                {project.status === 'in-review' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(project.id)}
                                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(project.id)}
                                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                                {project.status === 'active' && (
                                    <button
                                        onClick={() => handleDisable(project.id)}
                                        className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                                    >
                                        Disable
                                    </button>
                                )}
                                {project.status === 'disabled' && (
                                    <button
                                        onClick={() => handleEnable(project.id)}
                                        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                    >
                                        Enable
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectManagementPage;

