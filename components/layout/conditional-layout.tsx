"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current page is an auth page
  const isAuthPage = pathname.includes("/auth/") || pathname.includes("/auth-demo/");

  return (
    <>
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? "min-h-screen flex-1" : "flex-1"}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && (
        <div className="fixed bottom-6 right-6 z-50">
          <ScrollToTopButton
            variant="elegant"
            easing="easeInOut"
            showAfter={400}
            size="md"
          />
        </div>
      )}
    </>
  );
}
