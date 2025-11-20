import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import FeaturedProjects from './components/FeaturedProjects';
import Faqs from './components/Faqs';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import Stats from './components/Stats';
import Referral from './components/Referral';
import Pricing from './components/Pricing';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';

// --- Premium Context ---
interface PremiumContextType {
    isPremium: boolean;
    credits: number;
    setCredits: (credits: number) => void;
    setIsPremium: (isPremium: boolean) => void;
}

export const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const usePremium = (): PremiumContextType => {
    const context = useContext(PremiumContext);
    if (!context) {
        throw new Error('usePremium must be used within a PremiumProvider');
    }
    return context;
};

const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Load from localStorage or default values
    const [isPremium, setIsPremiumState] = useState<boolean>(() => {
        const stored = localStorage.getItem('isPremium');
        return stored === 'true';
    });
    
    const [credits, setCreditsState] = useState<number>(() => {
        const stored = localStorage.getItem('premiumCredits');
        return stored ? parseInt(stored, 10) : 0;
    });

    const setIsPremium = (premium: boolean) => {
        setIsPremiumState(premium);
        localStorage.setItem('isPremium', premium.toString());
        // When upgrading to premium, give initial credits
        if (premium && credits === 0) {
            setCreditsState(100);
            localStorage.setItem('premiumCredits', '100');
        }
    };

    const setCredits = (newCredits: number) => {
        setCreditsState(newCredits);
        localStorage.setItem('premiumCredits', newCredits.toString());
    };

    return (
        <PremiumContext.Provider value={{ isPremium, credits, setCredits, setIsPremium }}>
            {children}
        </PremiumContext.Provider>
    );
};
// --- End Premium Context ---

// --- Theme Context ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
// --- End Theme Context ---

// --- Navigation Context ---
type Page = 'home' | 'auth' | 'dashboard';
interface NavigationContextType {
  page: Page;
  navigateTo: (page: Page) => void;
}
export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// --- Auth Context ---
interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AppContent: React.FC = () => {
  const { page } = useNavigation();
  const { isLoggedIn } = useAuth();

  switch (page) {
    case 'auth':
      return <AuthPage />;
    case 'dashboard':
      return isLoggedIn ? <DashboardPage /> : <AuthPage />;
    case 'home':
    default:
      return (
        <div className="bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 overflow-x-hidden transition-colors duration-300">
          <Header />
          <main>
            <Hero />
            <Stats />
            <HowItWorks />
            <Referral />
            <FeaturedProjects />
            <Pricing />
            <Faqs />
            <CtaSection />
          </main>
          <Footer />
        </div>
      );
  }
};

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const navigateTo = (targetPage: Page) => {
    setPage(targetPage);
    window.scrollTo(0, 0);
  };
  
  const login = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    navigateTo('dashboard');
  };

  const logout = () => {
    setUserEmail(null);
    setIsLoggedIn(false);
    navigateTo('home');
  };

  return (
    <ThemeProvider>
      <PremiumProvider>
        <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
          <NavigationContext.Provider value={{ page, navigateTo }}>
            <AppContent />
          </NavigationContext.Provider>
        </AuthContext.Provider>
      </PremiumProvider>
    </ThemeProvider>
  );
};

export default App;
