'use client';

import { PropsWithChildren } from 'react';
import { LayoutThemeProvider } from '@/components/context';
import { EditorContextProvider } from '@/lib/editor';

export function LayoutProvider({ children }: PropsWithChildren) {
	return (
		<LayoutThemeProvider>
			<EditorContextProvider>{children}</EditorContextProvider>
		</LayoutThemeProvider>
	);
}
