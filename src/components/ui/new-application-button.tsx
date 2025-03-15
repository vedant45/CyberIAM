'use client';

import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSidebar } from './sidebar';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function NewApplicationButton() {
  const { open } = useSidebar();
  const { user } = useUser();
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const checkDatabase = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/check-database');
        const data = await response.json();
        
        if (response.ok) {
          setShowButton(!data.hasDatabase);
        } else {
          console.error('Failed to check database:', data.error);
        }
      } catch (error) {
        console.error('Error checking database:', error);
      }
    };

    checkDatabase();
  }, [user]);

  if (!showButton) return null;

  return (
    <button
      onClick={() => router.push('/new-application')}
      className="flex items-center gap-2 py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
      aria-label="New Application"
    >
      <IconPlus className="w-5 h-5 text-white" />
      <motion.span
        animate={{
          opacity: open ? 1 : 0,
          display: open ? "block" : "none",
        }}
        className="text-sm text-white font-medium"
      >
        New Application
      </motion.span>
    </button>
  );
}