
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { FileUpload } from '@/components/FileUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Upload as UploadIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';


const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [pageDragActive, setPageDragActive] = useState(false);
  const dragCounter = useRef(0);
  const fileUploadRef = useRef<{ handleExternalDrop: (files: File[]) => void } | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Page-level drag and drop
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer?.types.includes('Files')) {
        setPageDragActive(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setPageDragActive(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPageDragActive(false);
      dragCounter.current = 0;

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        // Trigger the file input click in the FileUpload component
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          // Create a DataTransfer to set files
          const dt = new DataTransfer();
          Array.from(e.dataTransfer.files).forEach(file => dt.items.add(file));
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <Layout>
      {/* Full-page drag overlay */}
      <AnimatePresence>
        {pageDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-red-50/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [-10, 0, -10] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="p-6 mb-4 rounded-full bg-printa-red/20 inline-block"
              >
                <UploadIcon size={64} className="text-printa-red" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Drop files here</h2>
              <p className="text-gray-600">Release to upload your files</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-24 pt-10"
      >
        <div className="max-w-4xl mx-auto px-4 lg:px-2" >
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Upload Documents</h1>
              <p className="text-gray-600">
                Upload the files you want to print
              </p>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-printa-red text-white flex items-center justify-center mr-2">1</span>
                Upload
              </span>
              <ArrowRight size={16} className="mx-2 text-gray-400" />
              <span className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">2</span>
                Customize
              </span>
              <ArrowRight size={16} className="mx-2 text-gray-400" />
              <span className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">3</span>
                Checkout
              </span>
            </div>
          </div>
          
          <FileUpload onFilesSelected={handleFilesSelected} />
          
          <div className="mt-8 flex justify-between items-center">
            <Link to="/" className="text-gray-500 hover:text-printa-red transition-colors">
              Cancel
            </Link>
            
            <Link
              to={selectedFiles.length > 0 ? `/customize${category ? `?category=${category}` : ''}` : "#"}
              onClick={(e) => {
                if (selectedFiles.length === 0) {
                  e.preventDefault();
                  toast.error("Please upload at least one file to continue");
                }
              }}
              className={`printa-btn-primary flex items-center ${
                selectedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Continue <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Upload;
