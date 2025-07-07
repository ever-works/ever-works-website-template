'use client';

import { PropsWithChildren } from 'react';
import { LayoutThemeProvider } from '@/components/context';

export function LayoutProvider({ children }: PropsWithChildren) {
  return <LayoutThemeProvider>{children}</LayoutThemeProvider>;
} 