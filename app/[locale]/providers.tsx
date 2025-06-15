"use client";

import type { Config } from "@/lib/content";
import { HeroUIProvider } from "@heroui/react";
import { ConfigProvider } from "./config";
import { ThemeProvider } from "next-themes";
import ErrorProvider from "@/components/error-provider";
import { LayoutThemeProvider } from "@/components/context";
import { FilterProvider } from "@/components/filters";

export function Providers({
  config,
  children,
}: {
  config: Config;
  children: React.ReactNode;
}) {
  return (
    <LayoutThemeProvider>
      <ErrorProvider>
        <FilterProvider>
          <ConfigProvider config={config}>
            <ThemeProvider
              enableSystem={true}
              attribute="class"
              defaultTheme="system">
                <HeroUIProvider>{children}</HeroUIProvider>
            </ThemeProvider>
          </ConfigProvider>
        </FilterProvider>
      </ErrorProvider>
    </LayoutThemeProvider>
  );
}
