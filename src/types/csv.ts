/**
 * CSV data structure including headers, rows, and column width information
 */
export interface ParsedCsvData {
  /** Column headers from the CSV file */
  headers: string[];
  /** Data rows from the CSV file */
  rows: string[][];
  /** Calculated widths for each column */
  columnWidths: number[];
}

/**
 * Constants for CSV viewer configuration and styling
 */
export const CSV_VIEWER = {
  /** Minimum width for any column in pixels */
  MIN_COLUMN_WIDTH: 120,
  /** Maximum width for any column in pixels */
  MAX_COLUMN_WIDTH: 300,
  /** Width multiplier for each character */
  CHAR_WIDTH: 12,
  /** Delay for transitions in milliseconds */
  TRANSITION_DELAY: 150,
  /** Accepted MIME types for CSV files */
  CSV_MIME_TYPES: ['text/csv', 'application/csv', 'application/x-csv'],
  /** Maximum rows to display in the viewer */
  MAX_ROWS: 10000,
  /** Default column width in pixels */
  DEFAULT_COLUMN_WIDTH: 150,
} as const;

/**
 * Utility functions for CSV data handling
 */
export const csvUtils = {
  /**
   * Calculates the optimal width for a column based on content length
   * @param {number} length - Length of the content in characters
   * @returns {number} Calculated width in pixels
   */
  calculateColumnWidth: (length: number): number => {
    return Math.max(
      CSV_VIEWER.MIN_COLUMN_WIDTH,
      Math.min(CSV_VIEWER.MAX_COLUMN_WIDTH, length * CSV_VIEWER.CHAR_WIDTH)
    );
  },

  /**
   * Validates a MIME type to ensure it's a CSV format
   * @param {string | null} mimeType - MIME type to validate
   * @returns {boolean} Whether the MIME type is valid for CSV
   */
  isValidCsvMimeType: (mimeType: string | null): boolean => {
    if (!mimeType) return false;
    return CSV_VIEWER.CSV_MIME_TYPES.some(type => mimeType.includes(type));
  },

  /**
   * Sanitizes a row from a CSV file by trimming whitespace and handling empty values
   * @param {string[]} row - Row of CSV data
   * @returns {string[]} Sanitized row
   */
  sanitizeRow: (row: string[]): string[] => {
    return row.map(cell => cell.trim());
  },

  /**
   * Checks if a row contains any non-empty values
   * @param {string[]} row - Row of CSV data
   * @returns {boolean} Whether the row has content
   */
  hasContent: (row: string[]): boolean => {
    return row.some(cell => cell.trim() !== '');
  }
} as const;