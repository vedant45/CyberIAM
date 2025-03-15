'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import DataTable from "@/components/DataTable";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function Home() {
  const { isLoaded } = useUser();

  // Don't render anything until authentication is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <SignedIn>
        <AuthenticatedLayout>
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
            {/* Data Table - Full width on mobile, constrained on desktop */}
            <div className="w-full lg:max-w-3xl">
              <DataTable />
            </div>
          </div>
        </AuthenticatedLayout>
      </SignedIn>

      <SignedOut>
        <div className="h-screen flex flex-col items-center justify-center bg-zinc-900">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-zinc-100 mb-4">
              Welcome to File Manager
            </h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Sign in or create an account to manage your files and data securely.
            </p>
            <div className="flex gap-4 justify-center">
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-zinc-800 text-zinc-100 rounded-md hover:bg-zinc-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 bg-zinc-700 text-zinc-100 rounded-md hover:bg-zinc-600 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
