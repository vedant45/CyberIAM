'use client';

import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/loading';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}