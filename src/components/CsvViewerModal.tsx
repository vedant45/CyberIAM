'use client';

import { useState, useEffect, useCallback, ReactElement, Suspense } from 'react';
import Papa from 'papaparse';
import { LoadingSpinner } from './ui/loading-spinner';
import { CsvErrorBoundary } from './CsvErrorBoundary';
import { CsvContent } from './CsvContent';
import { ParsedCsvData, CSV_VIEWER, csvUtils } from '@/types/csv';

interface CsvViewerModalProps {
  /** URL of the CSV file to load and display */
  fileUrl: string;
  /** Callback function to close the modal */
  onClose: () => void;
}

/**
 * A modal component that displays CSV data in a table format with a fixed header.
 * Features:
 * - Keyboard navigation (ESC to close)
 * - Error boundary for error handling
 * - Loading states and transitions
 * - CSV parsing and validation
 * - Column width calculation
 * - Error notifications
 * 
 * @param {CsvViewerModalProps} props - Component props
 * @returns {ReactElement} CSV viewer modal component
 */
export function CsvViewerModal({ fileUrl, onClose }: CsvViewerModalProps): ReactElement {
  const [csvData, setCsvData] = useState<ParsedCsvData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Set up keyboard event listeners and manage body scroll
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);

  // Load and parse CSV data
  useEffect(() => {
    let isMounted = true;
    let loadTimeout: NodeJS.Timeout;

    const fetchAndParseCsv = async () => {
      try {
        setIsTransitioning(true);
        setError(null);
        
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }

        const contentType = response.headers.get('content-type');
        if (!csvUtils.isValidCsvMimeType(contentType)) {
          throw new Error('Invalid file format - expected CSV');
        }
        
        const csvText = await response.text();
        
        Papa.parse<string[]>(csvText, {
          complete: (results) => {
            if (!isMounted) return;

            if (results.data.length > 0) {
              const headers = csvUtils.sanitizeRow(results.data[0]);
              const rows = results.data
                .slice(1)
                .filter(csvUtils.hasContent)
                .map(csvUtils.sanitizeRow);
              
              if (rows.length === 0) {
                throw new Error('CSV file is empty');
              }

              if (rows.length > CSV_VIEWER.MAX_ROWS) {
                throw new Error(`CSV file too large (max ${CSV_VIEWER.MAX_ROWS} rows)`);
              }

              const columnWidths = headers.map((_, index) => {
                const columnValues = [
                  headers[index],
                  ...rows.map(row => row[index] || '')
                ];
                const maxLength = Math.max(
                  ...columnValues.map(value => value.length)
                );
                return csvUtils.calculateColumnWidth(maxLength);
              });
              
              setCsvData({ headers, rows, columnWidths });
            } else {
              throw new Error('No data in CSV file');
            }
            setIsLoading(false);
            
            loadTimeout = setTimeout(() => {
              if (isMounted) {
                setIsTransitioning(false);
              }
            }, CSV_VIEWER.TRANSITION_DELAY);
          },
          error: (error) => {
            if (isMounted) {
              throw new Error(error.message || 'Failed to parse CSV file');
            }
          }
        });
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Failed to load CSV file';
          setError(message);
          setIsLoading(false);
          setIsTransitioning(false);
        }
      }
    };

    fetchAndParseCsv();

    return () => {
      isMounted = false;
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, [fileUrl]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Render loading state
  const renderLoading = (): ReactElement => (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <LoadingSpinner size="large" />
      <p className="text-zinc-400">Loading CSV data...</p>
    </div>
  );

  // Render error state
  const renderError = (): ReactElement => (
    <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-4">
      <div className="text-2xl">⚠️</div>
      <p>{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md transition-colors mt-4"
      >
        Retry
      </button>
    </div>
  );

  // Render empty state
  const renderEmpty = (): ReactElement => (
    <div className="flex items-center justify-center h-full text-zinc-400">
      No data available
    </div>
  );

  // Render content based on current state
  const renderContent = (): ReactElement => {
    if (isLoading) return renderLoading();
    if (error) return renderError();
    if (!csvData) return renderEmpty();

    return (
      <Suspense fallback={<LoadingSpinner size="large" />}>
        <CsvContent csvData={csvData} isTransitioning={isTransitioning} />
      </Suspense>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-viewer-title"
      aria-describedby="csv-viewer-description"
    >
      <div 
        className="backdrop-modal rounded-lg max-w-[70vw] border-2 border-primary w-full h-[80vh] relative animate-fade-in overflow-hidden"
        role="document"
      >
        {/* Modal Header */}
        <div className="absolute inset-x-0 top-0 backdrop-modal px-6 py-4 border-b border-zinc-800/50 rounded-t-lg z-20">
          <div className="flex justify-between items-center">
            <h2 id="csv-viewer-title" className="text-lg text-white font-medium flex items-center gap-3">
              CSV Viewer
              {isTransitioning && (
                <LoadingSpinner size="small" className="text-zinc-400" />
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-2"
              aria-label="Close CSV viewer"
            >
              ✕
            </button>
          </div>
          <p id="csv-viewer-description" className="sr-only">
            CSV file viewer with scrollable content. Press ESC to close.
          </p>
        </div>

        {/* Modal Content */}
        <div className="h-full pt-[4.5rem] pb-12">
          <CsvErrorBoundary>
            {renderContent()}
          </CsvErrorBoundary>
        </div>

        {/* Modal Footer */}
        <div className="absolute bottom-4 right-6 text-zinc-500 text-sm select-none">
          Press ESC to close
        </div>
      </div>
    </div>
  );
}
