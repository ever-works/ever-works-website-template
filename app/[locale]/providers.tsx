"use client";

import type { Config } from "@/lib/content";
import { HeroUIProvider } from "@heroui/react";
import { ConfigProvider } from "./config";
import {
  ErrorProvider,
  FilterProvider,
  LayoutProvider,
  QueryClientProvider,
  ThemeProvider,

} from "@/components/providers";

interface ProvidersProps {
  config: Config;
  children: React.ReactNode;
  dehydratedState?: unknown;
}

export function Providers({ config, children, dehydratedState }: ProvidersProps) {
  return (
    <QueryClientProvider dehydratedState={dehydratedState}>
      <LayoutProvider>
        <ErrorProvider>
          <FilterProvider>
            <ConfigProvider config={config}>
              <ThemeProvider>
                <HeroUIProvider>{children}</HeroUIProvider>
              </ThemeProvider>
            </ConfigProvider>
          </FilterProvider>
        </ErrorProvider>
      </LayoutProvider>
    </QueryClientProvider>
  );
}
