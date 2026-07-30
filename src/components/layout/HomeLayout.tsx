import React from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { WelcomeBanner } from "./WelcomeBanner";

interface HomeLayoutProps {
  children: React.ReactNode;
  showWelcomeBanner?: boolean;
}

export function HomeLayout({ children, showWelcomeBanner = true }: HomeLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Navigation />
      
      <main className="flex-grow max-w-7xl w-full mx-auto py-8 px-4 sm:px-8">
        {showWelcomeBanner && <WelcomeBanner />}
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
