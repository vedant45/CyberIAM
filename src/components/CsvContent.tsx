'use client';

import { ReactElement } from 'react';
import { ParsedCsvData } from '@/types/csv';

interface CsvContentProps {
  /** CSV data including headers, rows, and column widths */
  csvData: ParsedCsvData;
  /** Whether the content is in a transitioning state */
  isTransitioning: boolean;
}

/**
 * Renders the CSV data in a table format with fixed headers and scrollable content.
 * Features:
 * - Fixed header that stays visible while scrolling
 * - Column widths adjusted to content
 * - Empty cell placeholders
 * - Smooth scrolling
 * - Tooltips for truncated content
 * 
 * @param {CsvContentProps} props - Component properties
 * @returns {ReactElement} The table content with headers and rows
 */
export function CsvContent({ csvData, isTransitioning }: CsvContentProps): ReactElement {
  return (
    <div 
      className={`h-full relative transition-opacity duration-150 ${
        isTransitioning ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 backdrop-modal border-b border-zinc-700/50 shadow-sm px-6">
        <div className="flex">
          {csvData.headers.map((header, index) => (
            <div
              key={index}
              className="csv-header-cell flex-none p-3 text-left text-white font-medium"
              style={{ width: csvData.columnWidths[index] }}
              title={header}
            >
              {header}
            </div>
          ))}
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="overflow-auto h-[calc(100%-2.5rem)] scrollbar-hide px-6 csv-smooth-scroll">
        {csvData.rows.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className="csv-row flex"
            role="row"
          >
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className="csv-cell flex-none text-white"
                style={{ width: csvData.columnWidths[cellIndex] }}
                title={cell || undefined}
                role="cell"
              >
                {cell || <span className="text-zinc-500">—</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}