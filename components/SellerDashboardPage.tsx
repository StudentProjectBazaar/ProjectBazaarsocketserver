import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import { useAuth } from '../App';
import { WishlistProvider, CartProvider, type DashboardView } from './DashboardPage';

const SellerDashboardPage: React.FC = () => {
    const { userId } = useAuth();
    // Always use seller mode for this page
    const dashboardMode: 'seller' = 'seller';
    const [activeView, setActiveView] = useState<DashboardView>(() => {
        // If navigating with prefill, show dashboard view (which shows SellerDashboard)
        if (localStorage.getItem('prefillGitUrl')) {
            return 'dashboard'; // SellerDashboard will handle showing the upload form
        }
        return 'dashboard';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    // Close sidebar on mobile when clicking a nav item
    const handleNavClick = (view: DashboardView) => {
        setActiveView(view);
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    // Seller dashboard doesn't need mode switching, but we keep the prop for consistency
    const handleSetDashboardMode = (_mode: 'buyer' | 'seller') => {
        // In seller dashboard, we can optionally navigate to buyer dashboard
        // For now, we'll just reset the view
        setActiveView('dashboard');
    };

    return (
        <WishlistProvider userId={userId}>
            <CartProvider userId={userId}>
                <div className={`flex h-screen bg-white text-gray-900 font-sans transition-colors duration-300 relative`}>
                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}
                
                <Sidebar 
                    dashboardMode={dashboardMode} 
                    activeView={activeView}
                    setActiveView={handleNavClick}
                    isOpen={isSidebarOpen}
                    isCollapsed={isSidebarCollapsed}
                    onClose={() => setIsSidebarOpen(false)}
                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    onCollapseToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardContent 
                        dashboardMode={dashboardMode} 
                        setDashboardMode={handleSetDashboardMode}
                        activeView={activeView}
                        isSidebarOpen={isSidebarOpen}
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        setActiveView={setActiveView}
                    />
                </div>
            </div>
            </CartProvider>
        </WishlistProvider>
    );
};

export default SellerDashboardPage;

