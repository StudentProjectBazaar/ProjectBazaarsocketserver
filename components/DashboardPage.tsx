import React, { useState, createContext, useContext, ReactNode } from 'react';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import { useTheme } from '../App';

export type DashboardView = 'dashboard' | 'purchases' | 'wishlist' | 'cart' | 'analytics' | 'settings' | 'my-projects' | 'earnings' | 'payouts' | 'project-details' | 'seller-profile' | 'help-center';

interface WishlistContextType {
    wishlist: string[];
    toggleWishlist: (projectId: string) => void;
    isInWishlist: (projectId: string) => boolean;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = (): WishlistContextType => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

interface CartContextType {
    cart: string[];
    addToCart: (projectId: string) => void;
    removeFromCart: (projectId: string) => void;
    isInCart: (projectId: string) => boolean;
    cartCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};


const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<string[]>(['proj-1', 'proj-3']);

    const toggleWishlist = (projectId: string) => {
        setWishlist(prev => 
            prev.includes(projectId) 
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const isInWishlist = (projectId: string) => wishlist.includes(projectId);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    )
}

const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<string[]>([]);

    const addToCart = (projectId: string) => {
        setCart(prev => {
            if (!prev.includes(projectId)) {
                return [...prev, projectId];
            }
            return prev;
        });
    };

    const removeFromCart = (projectId: string) => {
        setCart(prev => prev.filter(id => id !== projectId));
    };

    const isInCart = (projectId: string) => cart.includes(projectId);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, isInCart, cartCount: cart.length }}>
            {children}
        </CartContext.Provider>
    );
};

const DashboardPage: React.FC = () => {
    const { theme } = useTheme();
    const [dashboardMode, setDashboardMode] = useState<'buyer' | 'seller'>('buyer');
    const [activeView, setActiveView] = useState<DashboardView>('dashboard');
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

    const handleSetDashboardMode = (mode: 'buyer' | 'seller') => {
        setDashboardMode(mode);
        setActiveView('dashboard');
    };

    return (
        <WishlistProvider>
            <CartProvider>
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

export default DashboardPage;