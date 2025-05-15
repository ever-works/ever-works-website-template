import { ReactNode } from "react";

export default function LayoutClassic({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-5 max-w-full">{children}</div>;
}
