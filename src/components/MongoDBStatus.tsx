'use client';

import { useState, useEffect, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';

export default function MongoDBStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null!);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/mongodb');
      const data = await response.json();
      setIsConnected(data.status === 'connected');
    } catch {
      setError('Failed to check connection status');
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkConnection();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mongodb', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to MongoDB');
      }
      
      setIsConnected(data.status === 'connected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to MongoDB');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center`}
      >
        <Popover.Trigger asChild>
          <button
            className={`fixed right-3 h-3 w-3 rounded transition-colors ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } focus:outline-none`}
            aria-label="Database connection status"
          />
        </Popover.Trigger>

        <AnimatePresence>
          {isOpen && (
            <Popover.Portal forceMount>
              <Popover.Content forceMount asChild>
                <motion.div
                  className="w-48 rounded-lg bg-zinc-900/95 p-4 shadow-lg border-0 outline-none"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{ 
                    position: 'fixed',
                    top: '0rem',
                    right: '0rem'
                  }}
                >
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-zinc-100">
                      {isConnected ? 'Connected to MongoDB' : 'Not connected'}
                    </p>
                    
                    {error && (
                      <p className="text-xs text-red-400">
                        {error}
                      </p>
                    )}
                    
                    {isConnected ? (
                      <button
                        disabled
                        className="w-full rounded-md bg-zinc-800 px-4 py-2 text-sm text-zinc-400 cursor-not-allowed outline-none border-0"
                      >
                        Connected!
                      </button>
                    ) : (
                      <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="w-full rounded-md bg-zinc-800 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 outline-none border-0"
                      >
                        {isLoading ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                </motion.div>
              </Popover.Content>
            </Popover.Portal>
          )}
        </AnimatePresence>
      </div>
    </Popover.Root>
  );
}