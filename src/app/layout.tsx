import type { Metadata } from "next";
import { MongoDBProvider } from "@/contexts/MongoDBContext";
import ClerkProvider from "@/components/ClerkProvider";
import { geistSans, geistMono } from "./fonts";
import ClientWrapper from "@/components/ClientWrapper";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <ClientWrapper>
          <ClerkProvider>
            <ClientLayout>
              <MongoDBProvider>
                {children}
              </MongoDBProvider>
            </ClientLayout>
          </ClerkProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}
