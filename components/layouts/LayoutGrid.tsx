import { ReactNode } from "react";

export default function LayoutGrid({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 rounded-xl">
      {children}
    </div>
  );
}
