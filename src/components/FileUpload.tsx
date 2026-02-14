
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, LayoutGrid, Plus, CheckCircle, FileText } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  uploadedAt?: Date;
  previewUrl?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const generatePreview = (file: File): string | undefined => {
    // Generate preview URL for images and PDFs
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  const handleFiles = useCallback((files: File[]) => {
    // Check file types
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const processedFiles: UploadingFile[] = [];

    files.forEach(file => {
      // Check file type
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Please upload PDF, JPG, PNG, or DOCX files.`);
        return;
      }

      // Check file size (50MB limit)
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File too large. Maximum size is 50MB.`);
        return;
      }

      processedFiles.push({
        file,
        progress: 0,
        status: 'uploading',
        previewUrl: generatePreview(file)
      });
    });

    if (processedFiles.length > 0) {
      setUploadingFiles(prev => [...prev, ...processedFiles]);

      // Simulate upload progress for each file
      processedFiles.forEach((uploadFile, index) => {
        simulateUpload(uploadingFiles.length + index);
      });
    }
  }, [uploadingFiles.length]);

  const simulateUpload = (fileIndex: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setUploadingFiles(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              progress: 100,
              status: 'complete',
              uploadedAt: new Date()
            };
            // Notify parent of completed file
            onFilesSelected([updated[fileIndex].file]);
          }
          return updated;
        });

        toast.success('File uploaded successfully!');
      } else {
        setUploadingFiles(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              progress
            };
          }
          return updated;
        });
      }
    }, 200);
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const getTimeAgo = (date?: Date) => {
    if (!date) return 'Uploading...';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Uploaded just now';
    if (seconds < 3600) return `Uploaded ${Math.floor(seconds / 60)}m ago`;
    return `Uploaded ${Math.floor(seconds / 3600)}h ago`;
  };

  const hasFiles = uploadingFiles.length > 0;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* Empty State - Drag and Drop Area */}
        {!hasFiles && (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-6 md:p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-printa-red bg-red-50 shadow-inner'
                : 'border-gray-300 hover:border-printa-red hover:bg-red-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
            />

            <div className="flex flex-col items-center justify-center py-4">
              <motion.div
                animate={{
                  y: dragActive ? [-8, 0, -8] : 0,
                }}
                transition={{
                  duration: 1.5,
                  repeat: dragActive ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="p-4 mb-4 rounded-full bg-red-100"
              >
                <Upload size={36} className="text-printa-red" />
              </motion.div>

              <h3 className="text-lg font-medium mb-2">
                {dragActive ? 'Drop files here' : 'Drag and drop files here'}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Use real sample jobs so your team can validate production quality during onboarding.
              </p>

              <p className="text-gray-500 mb-4 text-sm">
                or
              </p>

              <label htmlFor="file-upload" className="printa-btn-primary cursor-pointer px-6 py-3 text-sm">
                Browse Files
              </label>

              <p className="text-xs text-gray-400 mt-4">
                PDF, JPG, PNG, DOCX (max 50MB)
              </p>
            </div>
          </div>
        )}

        {/* File Cards Grid - File Manager Style */}
        {hasFiles && (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-4 md:p-6 transition-all duration-300 ${
              dragActive
                ? 'border-printa-red bg-red-50'
                : 'border-printa-red/50 hover:border-printa-red'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload-more"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
            />

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <AnimatePresence>
                {uploadingFiles.map((uploadFile, index) => (
                  <motion.div
                    key={`${uploadFile.file.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    {/* File Card */}
                    <div className="bg-gray-100 rounded-2xl aspect-square flex flex-col relative overflow-hidden">
                      {/* Remove button */}
                      <Button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        size="sm"
                      >
                        <X size={14} className="text-gray-600" />
                      </Button>

                      {/* Preview Area */}
                      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                        {uploadFile.status === 'complete' && uploadFile.previewUrl ? (
                          <>
                            {/* Image Preview */}
                            {uploadFile.file.type.startsWith('image/') && (
                              <img
                                src={uploadFile.previewUrl}
                                alt={uploadFile.file.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {/* PDF Preview */}
                            {uploadFile.file.type === 'application/pdf' && (
                              <div className="w-full h-full relative bg-white overflow-hidden">
                                <object
                                  data={`${uploadFile.previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                  type="application/pdf"
                                  className="w-full h-full pointer-events-none overflow-hidden"
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FileText size={40} className="text-red-500" />
                                  </div>
                                </object>
                                {/* Overlay to prevent interaction */}
                                <div className="absolute inset-0 bg-transparent" />
                              </div>
                            )}
                            {/* DOCX - Show icon */}
                            {uploadFile.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
                              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                <FileText size={40} className="text-blue-500" />
                              </div>
                            )}
                          </>
                        ) : (
                          // Loading state with centered icon
                          <div className="p-4">
                            {uploadFile.status === 'uploading' ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <LayoutGrid size={40} className="text-gray-400" />
                              </motion.div>
                            ) : (
                              <LayoutGrid size={40} className="text-gray-600" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Progress Bar - Only show while uploading */}
                      {uploadFile.status !== 'complete' && (
                        <div className="h-2 m-2 rounded-full bg-gray-200 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadFile.progress}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                            style={{
                              background: 'linear-gradient(to right, #e10000, #ff0000)'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="mt-2 px-1">
                      <p className="font-semibold text-sm truncate">{uploadFile.file.name.split('.')[0]}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {uploadFile.status === 'complete' && (
                          <CheckCircle size={12} className="text-printa-red" />
                        )}
                        <span>{getTimeAgo(uploadFile.uploadedAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add More Files Card */}
              <motion.label
                htmlFor="file-upload-more"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`bg-gray-50 border-2 border-dashed rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? 'border-printa-red bg-red-50'
                    : 'border-gray-300 hover:border-printa-red hover:bg-red-50/50'
                }`}
              >
                <div className="p-3 rounded-full bg-gray-100 mb-2">
                  <Plus size={24} className="text-gray-500" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Add more</span>
                <span className="text-xs text-gray-400 mt-1">Max 50MB</span>
              </motion.label>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
