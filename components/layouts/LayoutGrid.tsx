import { ReactNode } from "react";

export default function LayoutGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid justify-items-stretch grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
      {children}
    </div>
  );
}
