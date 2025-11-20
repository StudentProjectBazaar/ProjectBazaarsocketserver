import React, { useState } from 'react';
import type { BuyerProject } from './BuyerProjectCard';

interface Seller {
    name: string;
    email: string;
    avatar: string;
    rating: number;
    totalSales: number;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    posts?: number;
    followers?: number;
    following?: number;
}

interface SellerProfilePageProps {
    seller: Seller;
    sellerProjects: BuyerProject[];
    onBack: () => void;
}

type TabType = 'projects' | 'about' | 'reviews';

const SellerProfilePage: React.FC<SellerProfilePageProps> = ({ seller, sellerProjects, onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('projects');
    const [isFollowing, setIsFollowing] = useState(false);

    const sellerData = {
        ...seller,
        username: seller.username || seller.name.toLowerCase().replace(/\s+/g, ''),
        bio: seller.bio || `Front End Developer • Making Cool Projects\nScience, Technology & Engineering\n\nI create amazing projects and share my knowledge!\nI post about tech, coding, and more!`,
        location: seller.location || 'San Francisco, CA',
        website: seller.website || 'https://example.com',
        posts: seller.posts || sellerProjects.length,
        followers: seller.followers || Math.floor(Math.random() * 100000) + 1000,
        following: seller.following || Math.floor(Math.random() * 100) + 10,
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Project</span>
            </button>

            {/* Profile Header */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500">
                                <div className="w-full h-full rounded-full bg-white p-[2px]">
                                    {sellerData.avatar ? (
                                        <img 
                                            src={sellerData.avatar} 
                                            alt={sellerData.name} 
                                            className="w-full h-full rounded-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-3xl md:text-4xl">
                                            {sellerData.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{sellerData.username}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                    <span className="font-semibold text-gray-900">{sellerData.posts}</span>
                                    <span>posts</span>
                                    <span className="font-semibold text-gray-900">{sellerData.followers.toLocaleString()}</span>
                                    <span>followers</span>
                                    <span className="font-semibold text-gray-900">{sellerData.following}</span>
                                    <span>following</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsFollowing(!isFollowing)}
                                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                                        isFollowing
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                                    }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    Message
                                </button>
                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-900 mb-1">{sellerData.name}</p>
                            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                {sellerData.bio}
                            </div>
                            {sellerData.location && (
                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {sellerData.location}
                                </p>
                            )}
                            {sellerData.website && (
                                <a 
                                    href={sellerData.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-1 inline-block"
                                >
                                    {sellerData.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold text-gray-900">{sellerData.rating.toFixed(1)}</span>
                                <span className="text-sm text-gray-600">Rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="font-semibold text-gray-900">{sellerData.totalSales}</span>
                                <span className="text-sm text-gray-600">Sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold text-gray-900">{sellerData.posts}</span>
                                <span className="text-sm text-gray-600">Projects</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-8">
                    {(['projects', 'about', 'reviews'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-1 font-semibold text-sm transition-colors relative ${
                                activeTab === tab
                                    ? 'text-orange-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sellerProjects.map((project) => (
                            <div
                                key={project.id}
                                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                                <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                        <p className="font-semibold text-sm truncate">{project.title}</p>
                                        <p className="text-xs text-white/80">${project.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About {sellerData.name}</h3>
                        <div className="space-y-4 text-gray-700">
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Email</p>
                                <p className="text-sm">{sellerData.email}</p>
                            </div>
                            {sellerData.location && (
                                <div>
                                    <p className="font-medium text-gray-900 mb-2">Location</p>
                                    <p className="text-sm">{sellerData.location}</p>
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Member Since</p>
                                <p className="text-sm">January 2023</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Specialization</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Web Development', 'React', 'Node.js', 'Full Stack'].map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((review) => (
                            <div key={review} className="bg-white border border-gray-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold">
                                        U{review}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-gray-900">User {review}</span>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">2 days ago</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            Great seller! The project was exactly as described and delivered on time. Highly recommend!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerProfilePage;

