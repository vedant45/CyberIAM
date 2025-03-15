'use client';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="antialiased bg-background h-screen">
      {children}
    </div>
  );
}