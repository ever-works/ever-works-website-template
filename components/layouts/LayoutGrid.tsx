import { ReactNode } from "react";

export default function LayoutGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 ">
      {children}
    </div>
  );
}
