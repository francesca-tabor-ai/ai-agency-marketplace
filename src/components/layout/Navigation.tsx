import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useUser } from '../../hooks/useUser';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useUser();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsAccountMenuOpen(false);
    navigate('/');
  };

  const handleDropdownClick = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const dropdowns = {
    agencies: {
      label: 'Agencies',
      items: [
        { label: 'Find AI Agencies', path: '/agencies' },
        { label: 'Post Your Project', path: '/post-project' },
        { label: 'Agency Directory', path: '/agencies/directory' },
        { label: 'Success Stories', path: '/case-studies' },
      ],
    },
    jobs: {
      label: 'Jobs',
      items: [
        { label: 'Browse Jobs', path: '/jobs' },
        { label: 'Post a Job', path: '/jobs/post' },
        { label: 'Career Resources', path: '/jobs/resources' },
        { label: 'Talent Pool', path: '/jobs/talent' },
      ],
    },
    resources: {
      label: 'Resources',
      items: [
        { label: 'Resource Library', path: '/resources' },
        { label: 'Events', path: '/events' },
        { label: 'Blog', path: '/blog' },
        { label: 'Guides & Tutorials', path: '/resources/guides' },
      ],
    },
  };

  return (
    <nav className="bg-brand-dark/95 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <Building2 className="h-8 w-8 text-brand-light transform transition-transform group-hover:rotate-12" />
              <span className="ml-2 text-xl font-bold text-white">AIAM</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className={isActive('/') ? 'nav-link-active' : 'nav-link'}>
                Home
              </Link>
              
              {/* Dropdown Menus */}
              {Object.entries(dropdowns).map(([key, dropdown]) => (
                <div key={key} className="relative">
                  <button
                    onClick={() => handleDropdownClick(key)}
                    className={`flex items-center nav-link ${activeDropdown === key ? 'text-white' : ''}`}
                  >
                    {dropdown.label}
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === key ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === key && (
                    <div className="absolute top-full left-0 mt-2 w-56 rounded-md shadow-lg bg-brand-dark/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 animate-slide-down">
                      <div className="py-1">
                        {dropdown.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Link to="/pricing" className={isActive('/pricing') ? 'nav-link-active' : 'nav-link'}>
                Pricing
              </Link>
            </div>
          </div>

          {/* Desktop Account Menu */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className="flex items-center gap-2 text-gray-300 hover:text-brand-yellow px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">
                        {user.email?.split('@')[0] || 'Account'}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAccountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-brand-dark/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 animate-slide-down">
                        <div className="py-1">
                          <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                            {user.email}
                          </div>
                          <Link
                            to="/business-account"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                          >
                            <Settings className="h-4 w-4" />
                            Account Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-brand-dark transition-colors duration-150"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className="flex items-center text-gray-400 hover:text-brand-yellow px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      Account
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAccountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-brand-dark/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 animate-slide-down">
                        <div className="py-1">
                          <Link
                            to="/business-account"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                          >
                            For Businesses
                          </Link>
                          <Link
                            to="/agency-account"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                          >
                            For Agencies
                          </Link>
                          <Link
                            to="/login"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                          >
                            Sign Up
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <Link to="/post-project" className="btn-primary">
                  Post Your Project
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-brand-dark/50 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-down bg-brand-dark/95">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150">
              Home
            </Link>
            {Object.entries(dropdowns).map(([key, dropdown]) => (
              <div key={key}>
                <button
                  onClick={() => handleDropdownClick(key)}
                  className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                >
                  {dropdown.label}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === key ? 'rotate-180' : ''
                  }`} />
                </button>
                {activeDropdown === key && (
                  <div className="pl-6 space-y-1">
                    {dropdown.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link to="/pricing" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150">
              Pricing
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-brand-light/10">
            <div className="space-y-1">
              {user ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700 mb-2">
                    {user.email}
                  </div>
                  <Link
                    to="/business-account"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left block px-3 py-2 text-base font-medium text-gray-300 hover:text-red-400 hover:bg-brand-dark transition-colors duration-150"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/business-account"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                  >
                    For Businesses
                  </Link>
                  <Link
                    to="/agency-account"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                  >
                    For Agencies
                  </Link>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-yellow hover:bg-brand-dark transition-colors duration-150"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}