'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for handling CSV viewer errors gracefully.
 * Provides a fallback UI when errors occur in child components.
 */
export class CsvErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CSV Viewer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-4">
          <div className="text-2xl">⚠️</div>
          <p>Something went wrong displaying the CSV data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md transition-colors mt-4"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}