'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import MongoDBStatus from './MongoDBStatus';
import { useEffect, useState } from 'react';
import { Sidebar, SidebarBody, useSidebar } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import NewApplicationButton from '@/components/ui/new-application-button';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, isLoaded } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration by waiting for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until client-side mount and user data is loaded
  if (!isMounted || !isLoaded) {
    return null;
  }

  const userName = user?.firstName || 'User';

  return (
    <div className="h-screen flex flex-row">
      <Sidebar>
        <SidebarBody className="flex flex-col justify-between">
          <div className="flex-1">
            {/* Top section of sidebar */}
            <div className="space-y-4">
              <div className="px-3 space-y-4">
                <NewApplicationButton />
              </div>
            </div>
          </div>

          {/* Bottom section with user welcome and button */}
          <div className="mt-auto py-4">
            <div className="flex items-center gap-3">
              <UserProfile userName={userName} />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 h-full overflow-auto">
        {/* Main content area */}
        <div className="sticky top-0 z-10 bg-zinc-900/50 backdrop-blur-sm h-12 flex items-center px-4 border-b border-zinc-800">
          <MongoDBStatus />
        </div>

        <main className="p-4 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}

function UserProfile({ userName }: { userName: string }) {
  const { open } = useSidebar();

  return (
    <>
      <motion.span
        animate={{
          opacity: open ? 1 : 0,
          display: open ? "block" : "none",
        }}
        className="text-sm text-zinc-400 flex-1 truncate"
      >
        Welcome, {userName}
      </motion.span>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            rootBox: "w-8 h-8",
            userButtonBox: "w-8 h-8",
            userButtonPopover: "!left-12 !bottom-0",
            userButtonPopoverCard: "bg-zinc-800 border border-zinc-700",
            userButtonPopoverText: "text-zinc-100",
            userButtonPopoverActionButton: "hover:bg-zinc-700",
            userButtonPopoverActionButtonText: "text-zinc-100",
          }
        }}
      />
    </>
  );
}