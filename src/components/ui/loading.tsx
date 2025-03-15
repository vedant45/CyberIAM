'use client';

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1, 
        repeat: Infinity, 
        ease: "linear" as const 
      }}
      className={cn("h-4 w-4 border-2 border-zinc-600 border-t-zinc-200 rounded-full", className)}
    />
  );
}

export function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  );
}