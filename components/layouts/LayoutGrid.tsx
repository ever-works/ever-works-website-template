import { ReactNode } from "react";

export default function LayoutGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid justify-items-stretch grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {children}
    </div>
  );
}
