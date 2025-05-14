"use client";

import type { Config } from '@/lib/content';
import { HeroUIProvider } from '@heroui/react';
import { ConfigProvider } from './config';
import { ThemeProvider } from 'next-themes';
import ErrorProvider from '@/components/error-provider';

import { LayoutThemeProvider } from "@/components/context/LayoutThemeContext";

export function Providers({ config, children}: { config: Config, children: React.ReactNode }) {
  return (
    <LayoutThemeProvider>
      <ErrorProvider>
        <ConfigProvider config={config}>
          <ThemeProvider enableSystem={true} attribute="class" defaultTheme="dark">
            <HeroUIProvider>{children}</HeroUIProvider>
          </ThemeProvider>
        </ConfigProvider>
      </ErrorProvider>
    </LayoutThemeProvider>
  )
}
