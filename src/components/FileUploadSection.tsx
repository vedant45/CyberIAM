'use client';

import { FileUpload, FileUploadRef } from '@/components/ui/file-upload';
import { useState, useEffect, useRef } from 'react';

export default function FileUploadSection() {
  const [uploadStatus, setUploadStatus] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const fileUploadRef = useRef<FileUploadRef>(null);

  useEffect(() => {
    let resetTimer: NodeJS.Timeout;
    
    if (uploadStatus.status === 'success') {
      resetTimer = setTimeout(() => {
        setUploadStatus({ status: 'idle', message: '' });
        if (fileUploadRef.current) {
          fileUploadRef.current.reset();
        }
      }, 2000); // 2 seconds
    }

    return () => {
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
    };
  }, [uploadStatus.status]);

  const handleFileChange = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadStatus({ status: 'uploading', message: 'Uploading file...' });

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadStatus({
        status: 'success',
        message: `File ${files[0].name} uploaded successfully!`,
      });
    } catch (error) {
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload file',
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-center mb-2">File Upload</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-center">
          Upload files to MongoDB storage
        </p>
      </div>

      <FileUpload 
        ref={fileUploadRef} 
        onChange={handleFileChange} 
      />

      {uploadStatus.status !== 'idle' && (
        <div
          className={`mt-4 p-4 rounded-md ${
            uploadStatus.status === 'uploading'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
              : uploadStatus.status === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200'
          }`}
        >
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
}