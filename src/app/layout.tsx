import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { GenesisProvider } from "@/context/GenesisContext";
import { GenesisModal } from "@/components/GenesisModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartStream AI-CFM",
  description: "AI-Driven Continuous Flow Methodology Project Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="h-screen flex flex-col bg-slate-950 text-slate-50 overflow-hidden w-full relative" suppressHydrationWarning>
        <GenesisProvider>
          <Sidebar />
          <GlobalHeader />
          <GenesisModal />
          <main className="flex-1 min-h-0 ml-20 pt-16 overflow-y-auto w-[calc(100%-5rem)]">
            {children}
          </main>
        </GenesisProvider>
      </body>
    </html>
  );
}
