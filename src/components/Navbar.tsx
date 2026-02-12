
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  // We'll only show a few essential links
  const navLinks = [
    { name: 'Print', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <header className={`relative pt-3 top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/10 bg-opacity-90 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className=" tracking-tight"
            >
              <img src="/printa-logo-red.webp" alt="Printa" className="h-16 w-auto" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`nav-link ${isActive(link.path) ? 'active-nav-link' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex gap-1 items-center space-x-4">
            <Link to="/login" className="border-black border-2 py-4 px-4 rounded-xl hover:text-white hover:bg-black border-gray-100  text-gray-800 hover:text-printa-red transition-colors">
              Login
            </Link>
            <Link to="/signup" className="printa-btn-primary py-4 px-4 rounded-xl">
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            onClick={toggleMobileMenu}
            className="p-3 rounded-xl md:hidden focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-lg py-4 ${isActive(link.path) ? 'font-medium text-printa-red' : 'text-black'}`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-100 flex flex-col space-y-4">
                  <Link to="/login" className="text-lg py-4">
                    Login
                  </Link>
                  <Link to="/signup" className="printa-btn-primary text-center py-4">
                    Sign Up
                  </Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
