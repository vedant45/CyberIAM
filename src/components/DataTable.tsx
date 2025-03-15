"use client"

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { CsvViewerModal } from './CsvViewerModal';
import { ErrorNotification } from './ErrorNotification';
import { LoadingSpinner } from './ui/loading-spinner';
import { useMongoDBContext } from '@/contexts/MongoDBContext';

interface FileData {
  _id: string;
  name: string;
  number: number;
  uploadDate: string;
  url: string;
}

interface ErrorMessage {
  id: string;
  message: string;
}

export default function DataTable() {
  const { isConnected, isInitialized } = useMongoDBContext();
  const [data, setData] = useState<FileData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FileData;
    direction: 'asc' | 'desc' | null;
  } | null>(null);

  const REFRESH_INTERVAL = 10; // seconds
  const ITEMS_PER_PAGE = 10;

  const showError = useCallback((message: string) => {
    const newError = { id: Math.random().toString(36).substr(2, 9), message };
    setErrors(prev => [...prev, newError]);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const fetchData = useCallback(async () => {
    if (!isConnected) {
      setData([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/mongodb');
      const result = await response.json();
      
      // Update data while preserving pagination if possible
      const newData = result.data || [];
      const newTotalPages = Math.ceil(newData.length / ITEMS_PER_PAGE);
      
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
      
      setData(newData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data';
      showError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, showError, isConnected]);

  useEffect(() => {
    if (isInitialized && isConnected) {
      fetchData();
    }
  }, [isInitialized, isConnected, fetchData]);

  useEffect(() => {
    let isMounted = true;
    
    // Set up auto-refresh interval only when connected
    if (isConnected) {
      const intervalId = setInterval(() => {
        if (isMounted) {
          setCountdown(prev => {
            if (prev <= 1) {
              fetchData();
              return REFRESH_INTERVAL;
            }
            return prev - 1;
          });
        }
      }, 1000);

      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [fetchData, isConnected]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleRefresh = () => {
    fetchData();
    setCountdown(REFRESH_INTERVAL);
  };

  const handleSort = (key: keyof FileData) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig?.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig(direction === null ? null : { key, direction });
    
    if (direction === null) {
      fetchData();
    } else {
      const sortedData = [...data].sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];

        if (typeof valueA === 'undefined' || typeof valueB === 'undefined') {
          return 0;
        }

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      
      setData(sortedData);
    }
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowClick = async (file: FileData) => {
    if (!file.url) {
      showError(`No CSV data available for: ${file.name}`);
      return;
    }

    if (loadingFile) {
      return; // Prevent multiple simultaneous loads
    }

    setLoadingFile(file._id);

    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`Failed to load CSV file: ${file.name}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/csv')) {
        throw new Error('Invalid file format');
      }
      setSelectedFile(file.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      showError(`Error loading CSV file ${file.name}: ${message}`);
    } finally {
      setLoadingFile(null);
    }
  };

  // Don't render until MongoDB connection status is initialized
  if (!isInitialized) return null;

  return (
    <div className="w-full max-w-4xl bg-zinc-900 rounded-lg p-4">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {errors.map((error) => (
          <ErrorNotification
            key={error.id}
            message={error.message}
            onClose={() => removeError(error.id)}
          />
        ))}
      </div>

      <div className="mb-4 space-y-2">
        {!isConnected && (
          <div className="text-red-500 text-sm mb-2">
            Database disconnected. Connect to view data.
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!isConnected}
          />
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-sm whitespace-nowrap">
              Refresh in {countdown}s
            </span>
            <button
              onClick={handleRefresh}
              disabled={!isConnected || isLoading}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner size="small" /> : '↻'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th 
                  className="p-2 text-left cursor-pointer hover:bg-zinc-800"
                  onClick={() => handleSort('number')}
                >
                  <span className="inline-flex items-center gap-1 text-white">
                    Number
                    <span className="w-4">
                      {sortConfig?.key === 'number' && (
                        sortConfig.direction === 'asc' ? '↑' : 
                        sortConfig.direction === 'desc' ? '↓' : ''
                      )}
                    </span>
                  </span>
                </th>
                <th 
                  className="p-2 text-left cursor-pointer hover:bg-zinc-800"
                  onClick={() => handleSort('name')}
                >
                  <span className="inline-flex items-center gap-1 text-white">
                    Name
                    <span className="w-4">
                      {sortConfig?.key === 'name' && (
                        sortConfig.direction === 'asc' ? '↑' : 
                        sortConfig.direction === 'desc' ? '↓' : ''
                      )}
                    </span>
                  </span>
                </th>
                <th 
                  className="p-2 text-left cursor-pointer hover:bg-zinc-800"
                  onClick={() => handleSort('uploadDate')}
                >
                  <span className="inline-flex items-center gap-1 text-white">
                    Date Uploaded
                    <span className="w-4">
                      {sortConfig?.key === 'uploadDate' && (
                        sortConfig.direction === 'asc' ? '↑' : 
                        sortConfig.direction === 'desc' ? '↓' : ''
                      )}
                    </span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr 
                  key={item._id} 
                  className={`table-row-hover border-b border-zinc-800 cursor-pointer transition-all group relative ${
                    loadingFile === item._id ? 'animate-pulse' : ''
                  }`}
                  onClick={() => handleRowClick(item)}
                >
                  <td className="p-2 text-white">{item.number}</td>
                  <td className="p-2 text-white">{item.name}</td>
                  <td className="p-2 text-white">
                    {format(new Date(item.uploadDate), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="absolute inset-y-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity pr-2 flex items-center text-zinc-400">
                    {loadingFile === item._id ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="small" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      '→'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && paginatedData.length === 0 && (
          <div className="flex items-center justify-center py-12 text-zinc-400">
            No data available
          </div>
        )}
      </div>

      {totalPages > 1 && !isLoading && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-zinc-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700"
          >
            ←
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  page === currentPage
                    ? 'bg-zinc-600 text-white'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-zinc-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700"
          >
            →
          </button>
        </div>
      )}

      {selectedFile !== null && (
        <CsvViewerModal
          fileUrl={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}