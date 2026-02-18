import React, { useState, useEffect } from 'react';
import { useNavigation, useAuth, useTheme } from '../App';
import { Sun, Moon } from 'lucide-react';

const ORCHIDS_LOGO = 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/0fea2819-e0b6-4ab2-b4ab-ab4c64535352-oma-mindly-framer-website/assets/svgs/VT9XchCjHXRPw0H08BPtEicHVVs-1.svg';
const ORCHIDS_ARROW = 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/0fea2819-e0b6-4ab2-b4ab-ab4c64535352-oma-mindly-framer-website/assets/svgs/U0c022TYy3iR6YjbwbyxOaDRsk-2.svg';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { navigateTo } = useNavigation();
  const { isLoggedIn, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navBg = 'rgba(255,255,255,0.97)';
  const navShadow = 'rgba(0,0,0,0.18) 0px 0.6px 0.6px -1.25px, rgba(0,0,0,0.16) 0px 2.3px 2.3px -2.5px, rgba(0,0,0,0.06) 0px 10px 10px -3.75px';
  const linkColor = 'text-black hover:text-[#ff7a00]';
  const dividerColor = 'bg-[#E8E8E8]';
  const logoTextColor = 'text-black';

  interface NavLink {
    name: string;
    onClick?: () => void;
    highlight?: boolean;
  }

  const navLinks: NavLink[] = [
    { name: 'Curriculum', onClick: () => {
      const element = document.getElementById('curriculum');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Reviews', onClick: () => {
      const element = document.getElementById('reviews');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Pricing', onClick: () => {
      const element = document.getElementById('pricing');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'Why us', onClick: () => {
      const element = document.getElementById('why-choose-us');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }},
    { name: 'FAQs', onClick: () => navigateTo('faq') },
  ];

  const linkClass = `${linkColor} transition-colors duration-200 font-medium text-[14px]`;
  const navFontStyle = { fontFamily: '"Inter Tight", sans-serif' };

  const CtaButton: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
    <button
      onClick={onClick}
      style={navFontStyle}
      className="h-[42px] pl-5 pr-1.5 rounded-full bg-gradient-to-r from-[#ff7a00] to-[#ff9533] shadow-[0_4px_14px_rgba(255,122,0,0.35)] text-white text-[14px] font-semibold tracking-tight transition-all flex items-center gap-2 group hover:opacity-95"
    >
      <span className="mr-2">{children}</span>
      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <img src={ORCHIDS_ARROW} alt="" width={16} height={14} className="w-3 h-[10px] object-contain" />
      </span>
    </button>
  );

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[800px] px-4 pt-6 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center justify-between w-full h-[68px] px-4 rounded-[12px] backdrop-blur-[12px] transition-all duration-350"
        style={{
          backgroundColor: navBg,
          boxShadow: navShadow,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center justify-center w-9 h-9 shrink-0"
            aria-label="Go to homepage"
          >
            <img src={ORCHIDS_LOGO} alt="ProjectBazaar" width={35} height={36} className="w-full h-full object-contain" />
          </button>
          <div className={`w-px h-5 ${dividerColor} hidden sm:block`} />
          <span style={navFontStyle} className={`text-base font-semibold tracking-tight hidden sm:inline ${logoTextColor}`}>
            ProjectBazaar
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 px-4" style={navFontStyle}>
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
            className={`p-2 rounded-full transition-colors ${isScrolled ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-black/60 hover:text-black hover:bg-black/5'}`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {isLoggedIn ? (
            <>
              <button onClick={() => navigateTo('dashboard')} className={linkClass}>
                Dashboard
              </button>
              <button
                onClick={logout}
                className={`h-[42px] px-5 rounded-full text-sm font-semibold transition-all ${isScrolled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigateTo('auth')} className={linkClass}>
                Log In
              </button>
              <CtaButton onClick={() => navigateTo('auth')}>Join Now</CtaButton>
            </>
          )}
        </div>

        {/* Mobile: Theme + Menu toggle */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isScrolled ? 'text-white/80' : 'text-black/70'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg focus:outline-none ${isScrolled ? 'text-white' : 'text-black'}`}
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
        <div className={`md:hidden mt-3 rounded-[12px] p-6 shadow-xl backdrop-blur-[12px] ${isScrolled ? 'bg-black/90 border border-white/10' : 'bg-white border border-black/5'}`}>
          <nav className="flex flex-col items-center gap-4" style={navFontStyle}>
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
            <div className={`w-full h-px my-2 ${isScrolled ? 'bg-white/10' : 'bg-black/10'}`} />
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
                  className={`w-full font-semibold py-3 px-6 rounded-full ${isScrolled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
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
                  className="w-full h-12 rounded-full bg-gradient-to-r from-[#ff7a00] to-[#ff9533] text-white font-semibold flex items-center justify-center gap-2"
                >
                  Join Now
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <img src={ORCHIDS_ARROW} alt="" width={12} height={10} className="w-3 h-[10px] object-contain" />
                  </span>
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
