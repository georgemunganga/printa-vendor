
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CloudUpload, Truck, FileText } from 'lucide-react';

export const Hero: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-b from-white to-printa-gray">
      {/* Background Elements */}
      <motion.div 
        className="absolute top-1/4 right-1/6 w-64 h-64 rounded-full bg-printa-red opacity-5"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 left-1/6 w-48 h-48 rounded-full bg-printa-red opacity-5"
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [360, 270, 180, 90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div variants={itemVariants} className="inline-block px-4 py-1 rounded-full bg-white shadow-sm text-sm font-medium text-printa-red mb-6">
              Cloud-Based Printing Platform
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Print Anything, <span className="text-printa-red">Anywhere</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-8">
              Upload files from your device or cloud storage, customize your print options, and have them delivered or pick them up at a convenient location.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link to="/upload" className="printa-btn-primary flex items-center justify-center gap-2">
                Start Printing <ArrowRight size={18} />
              </Link>
              <Link to="/how-it-works" className="printa-btn-secondary flex items-center justify-center gap-2">
                How It Works
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="hidden md:block relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white to-printa-gray shadow-xl overflow-hidden">
                {/* Mock UI elements */}
                <div className="absolute top-8 left-8 right-8 h-40 bg-white rounded-xl shadow-md flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <CloudUpload size={40} className="text-printa-red mb-2" />
                    <div className="text-sm font-medium">Drop files here</div>
                  </div>
                </div>
                
                <div className="absolute top-56 left-8 w-48 h-24 bg-white rounded-xl shadow-md p-4 flex items-center">
                  <FileText size={24} className="text-printa-red mr-3" />
                  <div className="text-xs">
                    <div className="font-medium">Document.pdf</div>
                    <div className="text-gray-400 mt-1">5 pages · Color</div>
                  </div>
                </div>
                
                <div className="absolute top-56 right-8 w-48 h-24 bg-white rounded-xl shadow-md p-4 flex items-center">
                  <Truck size={24} className="text-printa-red mr-3" />
                  <div className="text-xs">
                    <div className="font-medium">Delivery</div>
                    <div className="text-gray-400 mt-1">Pick up or deliver</div>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-8 right-8 h-16 bg-printa-red rounded-xl shadow-md flex items-center justify-center text-white font-medium">
                  Complete Order
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-white shadow-lg flex items-center justify-center p-4"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968517.png" alt="PDF" className="w-12 h-12" />
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-6 -left-6 w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Word" className="w-10 h-10" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
