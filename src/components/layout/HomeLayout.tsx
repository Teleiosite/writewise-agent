
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        {showWelcomeBanner && <WelcomeBanner />}
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
