import { ReactNode } from "react";

export default function LayoutCards({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-6 justify-center p-8 bg-gradient-to-br from-blue-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl">
      {children}
    </div>
  );
}
