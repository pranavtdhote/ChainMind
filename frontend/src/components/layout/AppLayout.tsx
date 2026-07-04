"use client";

import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      {/* Top Header Navigation */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10 scrollbar-thin">
          <div className="mx-auto max-w-[1280px]">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
