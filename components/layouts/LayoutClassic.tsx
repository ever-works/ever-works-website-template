import { ReactNode } from "react";

export default function LayoutClassic({ children }: { children: ReactNode }) {
  return <div className="dark:bg-gray-900 rounded-xl p-8">{children}</div>;
}
