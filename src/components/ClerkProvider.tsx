'use client';

import { ClerkProvider as Clerk } from '@clerk/nextjs';

export default function ClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Clerk
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-zinc-800 border-zinc-700",
          headerTitle: "text-zinc-100",
          headerSubtitle: "text-zinc-400",
          formButtonPrimary: "bg-zinc-700 hover:bg-zinc-600",
          formFieldInput: "bg-zinc-900 border-zinc-700 text-zinc-100",
          formFieldLabel: "text-zinc-400",
          footerActionLink: "text-zinc-400 hover:text-zinc-300"
        }
      }}
    >
      {children}
    </Clerk>
  );
}