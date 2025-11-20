import React, { useState, useRef, useEffect } from 'react';
import type { DashboardView } from './DashboardPage';
import { usePremium } from '../App';

const ToggleButton = ({ text, active, onClick }: { text: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${active ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:bg-orange-50'}`}>
        {text}
    </button>
);

interface DashboardHeaderProps {
    dashboardMode: 'buyer' | 'seller';
    setDashboardMode: (mode: 'buyer' | 'seller') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeView: DashboardView;
    buyerProjectView: 'all' | 'activated' | 'disabled';
    setBuyerProjectView: (view: 'all' | 'activated' | 'disabled') => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const viewTitles: Record<DashboardView, string> = {
    'dashboard': 'Dashboard',
    'purchases': 'My Purchases',
    'wishlist': 'My Wishlist',
    'cart': 'Shopping Cart',
    'analytics': 'Analytics',
    'settings': 'Settings',
    'my-projects': 'My Projects',
    'earnings': 'Earnings',
    'payouts': 'Payouts',
    'project-details': 'Project Details',
    'seller-profile': 'Seller Profile',
    'help-center': 'Help Center',
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ dashboardMode, setDashboardMode, searchQuery, setSearchQuery, activeView, buyerProjectView, setBuyerProjectView, isSidebarOpen, toggleSidebar }) => {
    const title = viewTitles[activeView] || 'Dashboard';
    const isBuyerDashboard = activeView === 'dashboard' && dashboardMode === 'buyer';
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [unreadCount] = useState(5);
    const { isPremium, credits } = usePremium();

    // Sample notifications
    const notifications = [
        { id: 1, type: 'purchase', message: 'Your purchase "E-commerce Platform" is ready for download', time: '2 hours ago', read: false },
        { id: 2, type: 'sale', message: 'You made a sale! "Portfolio Template" was purchased', time: '5 hours ago', read: false },
        { id: 3, type: 'message', message: 'New message from John Developer', time: '1 day ago', read: false },
        { id: 4, type: 'update', message: 'Project "Task Management Tool" has been updated', time: '2 days ago', read: true },
        { id: 5, type: 'review', message: 'You received a new 5-star review', time: '3 days ago', read: false },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };

        if (isNotificationOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotificationOpen]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'purchase':
                return (
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'sale':
                return (
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                    </svg>
                );
            case 'message':
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            case 'review':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu Button */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-lg hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isSidebarOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Premium Credits Display */}
                    {isPremium && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl">
                            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 2v.01M12 20v.01M3 12h.01M21 12h.01M4.207 4.207l.01.01M19.793 4.207l.01.01M4.207 19.793l.01.01M19.793 19.793l.01.01" />
                            </svg>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">Credits</span>
                                <span className="text-lg font-bold text-orange-600">{credits}</span>
                            </div>
                        </div>
                    )}

                    {/* Notification Button */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2.5 rounded-xl hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-all duration-200 group"
                            aria-label="Notifications"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-50/50 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                {/* Notifications List */}
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`px-6 py-4 hover:bg-orange-50/30 transition-colors cursor-pointer ${
                                                        !notification.read ? 'bg-orange-50/20' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 mt-0.5">
                                                            {getNotificationIcon(notification.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                        </div>
                                                        {!notification.read && (
                                                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-6 py-12 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            <p className="text-gray-500 text-sm font-medium">No notifications</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                                    <button className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium">
                                        View All Notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-600">Mode:</p>
                    <div className="flex items-center p-1 bg-orange-50 rounded-lg">
                        <button 
                            onClick={() => setDashboardMode('buyer')}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${dashboardMode === 'buyer' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            Buyer
                        </button>
                        <button
                             onClick={() => setDashboardMode('seller')}
                             className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${dashboardMode === 'seller' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            Seller
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
                {isBuyerDashboard ? (
                     <div className="flex items-center p-1 bg-orange-50 rounded-lg">
                        <ToggleButton text="All Projects" active={buyerProjectView === 'all'} onClick={() => setBuyerProjectView('all')} />
                        <ToggleButton text="Activated" active={buyerProjectView === 'activated'} onClick={() => setBuyerProjectView('activated')} />
                        <ToggleButton text="Disabled" active={buyerProjectView === 'disabled'} onClick={() => setBuyerProjectView('disabled')} />
                    </div>
                ) : (
                    <div></div> // Placeholder to keep alignment
                )}
               
                <div className="flex space-x-3">
                    {isBuyerDashboard && buyerProjectView === 'all' && (
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                            <input 
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                placeholder="Search projects..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;