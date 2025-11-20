import React, { useState } from 'react';
import ProjectDashboardCard from './ProjectDashboardCard';
import { useNavigation, usePremium } from '../App';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-5">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

interface SectionCardProps {
    title: string;
    children: React.ReactNode;
    step: number;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, step }) => (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">{step}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

interface InputFieldProps {
    id: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, type = 'text', placeholder, required = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            type={type} 
            id={id} 
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
        />
    </div>
);

interface TextAreaProps {
    id: string;
    label: string;
    placeholder?: string;
    rows?: number;
}

const TextArea: React.FC<TextAreaProps> = ({ id, label, placeholder, rows = 4 }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            id={id}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900"
        />
    </div>
)

interface UploadedProject {
    id: string;
    name: string;
    domain: string;
    description: string;
    logo: string;
    tags: string[];
    status: 'Live' | 'In Review' | 'Draft';
    sales: number;
    price: number;
    category: string;
}

const MAX_FREE_PROJECTS = 5;

type ViewMode = 'grid' | 'table';

const SellerDashboard: React.FC = () => {
    const { navigateTo } = useNavigation();
    const { isPremium } = usePremium();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [uploadedProjects, setUploadedProjects] = useState<UploadedProject[]>([
        {
            id: 'upload-1',
            name: 'E-commerce Platform',
            domain: 'ecommerce-demo.com',
            description: 'A full-stack e-commerce solution built with MERN stack, including payment integration.',
            logo: 'https://images.unsplash.com/photo-1534237693998-0c6218f200b3?q=80&w=2070&auto=format&fit=crop',
            tags: ['React', 'Node.js', 'MongoDB'],
            status: 'Live',
            sales: 45,
            price: 49.99,
            category: 'Web Development',
        },
        {
            id: 'upload-2',
            name: 'Task Management Tool',
            domain: 'taskmanager-demo.com',
            description: 'A Kanban-style task management application to organize and track your team\'s workflow.',
            logo: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1964&auto=format&fit=crop',
            tags: ['Vue.js', 'Firebase', 'TailwindCSS'],
            status: 'Live',
            sales: 18,
            price: 44.99,
            category: 'Web Application',
        },
        {
            id: 'upload-3',
            name: 'Social Media App',
            domain: 'socialmedia-demo.com',
            description: 'A modern social media application with real-time features and media sharing.',
            logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
            tags: ['React Native', 'Firebase', 'TypeScript'],
            status: 'Live',
            sales: 32,
            price: 59.99,
            category: 'Mobile App',
        },
        {
            id: 'upload-4',
            name: 'Sales Prediction AI',
            domain: 'salesai-demo.com',
            description: 'AI-powered sales forecasting tool with machine learning algorithms.',
            logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
            tags: ['Python', 'TensorFlow', 'Flask'],
            status: 'In Review',
            sales: 0,
            price: 79.99,
            category: 'Data Science',
        },
        {
            id: 'upload-5',
            name: '2D Platformer Game',
            domain: 'platformer-demo.com',
            description: 'A fun 2D platformer game with multiple levels and character customization.',
            logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
            tags: ['Unity', 'C#', 'Game Design'],
            status: 'Draft',
            sales: 0,
            price: 39.99,
            category: 'Game Development',
        },
        {
            id: 'upload-6',
            name: 'Fintech App UI Kit',
            domain: 'fintechui-demo.com',
            description: 'Complete UI kit for fintech applications with modern design components.',
            logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
            tags: ['Figma', 'Design System', 'UI/UX'],
            status: 'Live',
            sales: 61,
            price: 29.99,
            category: 'UI/UX Design',
        },
    ]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPremium && uploadedProjects.length >= MAX_FREE_PROJECTS) {
            setShowPremiumModal(true);
            return;
        }
        // Handle form submission
        // After successful upload, add to uploadedProjects and hide form
        setShowUploadForm(false);
    };

    const handleUploadClick = () => {
        if (!isPremium && uploadedProjects.length >= MAX_FREE_PROJECTS) {
            setShowPremiumModal(true);
        } else {
            setShowUploadForm(true);
        }
    };



    return (
        <div className="mt-8 space-y-8">
            {/* Stats */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value="$8,450" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} colorClass="bg-gradient-to-br from-green-500 to-green-600" />
                <StatCard title="Projects Sold" value="102" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
                <StatCard title="Active Projects" value={uploadedProjects.length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} colorClass="bg-gradient-to-br from-purple-500 to-purple-600" />
            </div>

            {/* Uploaded Projects Grid (shown by default) */}
            {!showUploadForm && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">My Uploaded Projects</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {uploadedProjects.length} of {MAX_FREE_PROJECTS} projects uploaded
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* View Toggle Buttons */}
                            <div className="flex items-center bg-orange-50 rounded-lg p-1 border border-orange-200">
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
                            </div>
                            <button
                                onClick={handleUploadClick}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-white transition-all shadow-md hover:shadow-lg"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Upload Project
                            </button>
                        </div>
                    </div>

                    {uploadedProjects.length > 0 ? (
                        <>
                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {uploadedProjects.map((project) => (
                                        <ProjectDashboardCard
                                            key={project.id}
                                            name={project.name}
                                            domain={project.domain}
                                            description={project.description}
                                            logo={project.logo}
                                            tags={project.tags}
                                            status={project.status}
                                            sales={project.sales}
                                            price={project.price}
                                            category={project.category}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Table View */}
                            {viewMode === 'table' && (
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Project Title
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Sales
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Price
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {uploadedProjects.map((project) => (
                                                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <p className="text-sm font-medium text-gray-900">{project.name}</p>
                                                            <p className="text-sm text-gray-500">{project.category}</p>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                                project.status === 'Live'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : project.status === 'In Review'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {project.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {project.sales}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                            ${project.price.toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <button className="p-2 text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                                                                    </svg>
                                                                </button>
                                                                <button className="p-2 text-red-600 hover:bg-gray-100 rounded-md transition-colors" title="Delete">
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No projects uploaded yet</p>
                            <p className="text-gray-400 text-sm mt-2">Click "Upload Project" to get started</p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Form (shown when Upload Project is clicked) */}
            {showUploadForm && (
                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Upload New Project</h2>
                        <button
                            type="button"
                            onClick={() => setShowUploadForm(false)}
                            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                <SectionCard title="Project Details" step={1}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField id="title" label="Project Title" placeholder="e.g., E-commerce Platform" required />
                        <InputField id="category" label="Category" placeholder="e.g., Web Development" required />
                    </div>
                    <div className="mt-6">
                        <TextArea id="description" label="Description" placeholder="Describe your project in detail..." />
                    </div>
                     <div className="mt-6">
                        <InputField id="tags" label="Tags" placeholder="e.g., React, Node.js, API (comma-separated)" />
                    </div>
                </SectionCard>

                <SectionCard title="Pricing & Media" step={2}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField id="price" label="Price (USD)" type="number" placeholder="e.g., 49.99" required />
                        <InputField id="youtube" label="YouTube Video URL" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                     <div className="mt-6">
                        <InputField id="docs" label="Documentation URL" placeholder="https://docs.example.com" />
                    </div>
                </SectionCard>

                 <SectionCard title="Uploads" step={3}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Project Thumbnail</label>
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="h-48 w-auto object-cover rounded-md" />
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"><span>Upload a file</span><input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" /></label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Project Files (.zip)</label>
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"><span>Upload files</span><input id="file-upload" name="file-upload" type="file" className="sr-only" /></label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">ZIP file up to 50MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <div className="flex justify-end gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setShowUploadForm(false)}
                            className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button type="button" className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Save as Draft</button>
                        <button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg">Submit for Review</button>
                </div>
            </form>
            )}

            {/* Premium Modal */}
            {showPremiumModal && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPremiumModal(false)}
                    >
                        <div 
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="text-center mb-6">
                                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Premium</h3>
                                <p className="text-gray-600">
                                    You've reached the limit of {MAX_FREE_PROJECTS} free projects. Upgrade to Premium to upload unlimited projects!
                                </p>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Premium Benefits:</h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Unlimited project uploads
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Priority support
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Advanced analytics
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Featured project placement
                                    </li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPremiumModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPremiumModal(false);
                                        navigateTo('home');
                                        // Scroll to pricing section after navigation
                                        setTimeout(() => {
                                            const pricingSection = document.getElementById('pricing');
                                            if (pricingSection) {
                                                pricingSection.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }, 100);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    Buy Premium
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SellerDashboard;