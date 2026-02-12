
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: React.ReactNode;
  hideNavbarOnMobile?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideNavbarOnMobile }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {hideNavbarOnMobile ? (
        <div className="hidden md:block">
          <Navbar />
        </div>
      ) : (
        <Navbar />
      )}
      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};
