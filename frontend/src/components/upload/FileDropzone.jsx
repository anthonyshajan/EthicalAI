import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Code, Presentation, File, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fileIcons = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  py: Code,
  js: Code,
  java: Code,
  cpp: Code,
  c: Code,
  ppt: Presentation,
  pptx: Presentation,
  default: File
};

const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  return fileIcons[extension] || fileIcons.default;
};

export default function FileDropzone({ onFileSelect, acceptedTypes, maxSize = 10, label }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  const FileIcon = selectedFile ? getFileIcon(selectedFile.name) : Upload;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <Card
        className={`relative border-2 border-dashed transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="p-8 text-center">
          <AnimatePresence mode="wait">
            {!selectedFile ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <p className="text-base font-medium text-gray-700 mb-2">
                  {isDragging ? 'Drop file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supported: {acceptedTypes} • Max {maxSize}MB
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4"
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <FileIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors relative z-20"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}