import React, { useState } from 'react';

interface HelpTopic {
    id: string;
    title: string;
    description: string;
    author: string;
    authorAvatar: string;
    videoCount: number;
    icon: React.ReactNode;
}

const helpTopics: HelpTopic[] = [
    {
        id: 'getting-started',
        title: 'Getting Started with ProjectBazaar',
        description: 'Welcome to ProjectBazaar Dive into basic for a swift on boarding experience',
        author: 'Aston Martin',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        videoCount: 19,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
        )
    },
    {
        id: 'admin-settings',
        title: 'Admin Settings',
        description: 'Learn how to manage your current workspace or your enterprise space',
        author: 'Michael A. Miner',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        videoCount: 10,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    },
    {
        id: 'server-setup',
        title: 'Server Setup',
        description: 'Connect, simplify, and automate. Discover the power of apps and tools.',
        author: 'Theresa T. Brose',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        videoCount: 7,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
        )
    },
    {
        id: 'login-verification',
        title: 'Login And Verification',
        description: 'Read on to learn how to sign in with your email address, or your Apple or Google.',
        author: 'James L. Erickson',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        videoCount: 3,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        )
    },
    {
        id: 'account-setup',
        title: 'Account Setup',
        description: 'Adjust your profile and preferences to make ProjectBazaar work just for you',
        author: 'Lily Wilson',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        videoCount: 11,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    },
    {
        id: 'trust-safety',
        title: 'Trust & Safety',
        description: 'Trust on our current database and learn how we distribute your data.',
        author: 'Sarah Brooks',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        videoCount: 9,
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )
    }
];

const videoThumbnails = [
    {
        id: 1,
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        title: 'Business Team Discussion',
        source: 'YouTube'
    },
    {
        id: 2,
        thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
        title: 'Discussion Stock Video',
        source: 'PEXBELL'
    },
    {
        id: 3,
        thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
        title: 'Coding Free Stock',
        source: 'PEXBELL'
    },
    {
        id: 4,
        thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
        title: 'Working Stock Footage',
        source: 'PEXBELL'
    }
];

const HelpCenterPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

    const filteredTopics = helpTopics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full overflow-y-auto bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">HELP CENTER</h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-8">
                {/* Hero Banner */}
                <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
                    <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    ></div>
                    <div className="relative px-8 py-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Help Center</h2>
                        <p className="text-xl text-gray-200 mb-8">How can we help you?</p>
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTopics.map((topic) => (
                        <div
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:border-orange-300 hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    {topic.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                        {topic.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {topic.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={topic.authorAvatar}
                                        alt={topic.author}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="text-sm text-gray-600">by {topic.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-semibold text-orange-600">{topic.videoCount}</span>
                                    <span className="text-sm text-gray-500">Video</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            {selectedTopic && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedTopic(null)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                <h3 className="text-xl font-bold text-gray-900">Show Video</h3>
                                <button
                                    onClick={() => setSelectedTopic(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <h4 className="text-2xl font-bold text-gray-900 mb-6">{selectedTopic.title}</h4>

                                {/* Video Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {videoThumbnails.map((video) => (
                                        <div key={video.id} className="relative group cursor-pointer">
                                            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                {video.source === 'YouTube' && (
                                                    <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                                        YouTube
                                                    </div>
                                                )}
                                                {video.source === 'PEXBELL' && (
                                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
                                                        {video.title}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* More Video Button */}
                                <div className="flex justify-end">
                                    <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg">
                                        More Video
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HelpCenterPage;

