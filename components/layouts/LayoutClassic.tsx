import { ReactNode } from "react";

export default function LayoutClassic({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      {children}
    </div>
  );
}
