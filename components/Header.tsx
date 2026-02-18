import React, { useState, useEffect } from 'react';
import { useNavigation, useAuth, useTheme } from '../App';
import { Sun, Moon } from 'lucide-react';

const LogoIcon: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="url(#logo-gradient)" />
    <defs>
      <linearGradient id="logo-gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff7a00"/>
        <stop offset="1" stopColor="#ff9533"/>
      </linearGradient>
    </defs>
  </svg>
);

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { navigateTo } = useNavigation();
  const { isLoggedIn, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollY > 20;
  const navBg = isScrolled ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.75)';
  const navShadow = isScrolled ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.2)';

  interface NavLink {
    name: string;
    onClick?: () => void;
    highlight?: boolean;
  }

  const navLinks: NavLink[] = [
    { name: 'Projects', onClick: () => {
      const element = document.getElementById('projects');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Browse', onClick: () => navigateTo('browseFreelancers') },
    { name: 'Solutions', onClick: () => {
      const element = document.getElementById('how-it-works');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Pricing', onClick: () => {
      const element = document.getElementById('pricing');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'FAQs', onClick: () => navigateTo('faq') },
  ];

  const linkClass = 'text-white/90 hover:text-[#ff7a00] transition-colors duration-200 font-medium text-[14px]';

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[900px] px-4 pt-6 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center justify-between w-full h-[68px] px-4 rounded-[12px] backdrop-blur-[12px] border border-white/10 transition-all duration-350"
        style={{
          backgroundColor: navBg,
          boxShadow: navShadow,
        }}
      >
        {/* Logo + divider */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center justify-center w-9 h-9 shrink-0"
            aria-label="Go to homepage"
          >
            <LogoIcon />
          </button>
          <div className="w-px h-5 bg-white/20 hidden sm:block" />
          <span className="text-lg font-bold text-white tracking-tight hidden sm:inline">
            ProjectBazaar
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 px-4">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.onClick}
              className={linkClass}
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Desktop: Theme + Auth */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigateTo('dashboard')}
                className={linkClass}
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="h-[42px] px-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigateTo('auth')}
                className={linkClass}
              >
                Log In
              </button>
              <button
                onClick={() => navigateTo('auth')}
                className="h-[42px] px-5 rounded-full bg-gradient-to-r from-[#ff7a00] to-[#ff9533] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(255,122,0,0.35)] hover:opacity-95 transition-all flex items-center gap-2"
              >
                Join Now
                <svg width="14" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </>
          )}
        </div>

        {/* Mobile: Theme + Menu toggle */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-white/80"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg focus:outline-none text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 rounded-[12px] p-6 border border-white/10 backdrop-blur-[12px] bg-black/90">
          <nav className="flex flex-col items-center gap-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  link.onClick?.();
                  setIsOpen(false);
                }}
                className={linkClass}
              >
                {link.name}
              </button>
            ))}
            <div className="w-full h-px my-2 bg-white/10" />
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => { navigateTo('dashboard'); setIsOpen(false); }}
                  className={linkClass}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { navigateTo('auth'); setIsOpen(false); }}
                  className={linkClass}
                >
                  Log In
                </button>
                <button
                  onClick={() => { navigateTo('auth'); setIsOpen(false); }}
                  className="w-full bg-gradient-to-r from-[#ff7a00] to-[#ff9533] text-white font-semibold py-3 px-6 rounded-full"
                >
                  Join Now
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
