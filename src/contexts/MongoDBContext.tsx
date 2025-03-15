'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useUser } from "@clerk/nextjs";

interface MongoDBState {
  isConnected: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface MongoDBContextType extends MongoDBState {
  checkConnection: () => Promise<void>;
  connect: () => Promise<void>;
}

const MongoDBContext = createContext<MongoDBContextType | null>(null);

export function MongoDBProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MongoDBState>({
    isConnected: false,
    isInitialized: false,
    error: null,
  });
  const {user} = useUser();
  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/mongodb?db=${encodeURIComponent(user?.firstName as string)}`
      );
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isConnected: data.status === 'connected',
        error: data.error || null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Failed to check connection',
      }));
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      const response = await fetch('/api/mongodb', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to MongoDB');
      }
      
      setState(prev => ({
        ...prev,
        isConnected: data.status === 'connected',
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error.message : 'Failed to connect to MongoDB',
      }));
    }
  }, []);

  useEffect(() => {
    if (!state.isInitialized) {
      checkConnection();
    }
  }, [state.isInitialized, checkConnection]);

  return (
    <MongoDBContext.Provider value={{ ...state, checkConnection, connect }}>
      {children}
    </MongoDBContext.Provider>
  );
}

export function useMongoDBContext() {
  const context = useContext(MongoDBContext);
  if (!context) {
    throw new Error('useMongoDBContext must be used within a MongoDBProvider');
  }
  return context;
}