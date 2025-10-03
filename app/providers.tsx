"use client";

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { StoreProvider } from '@/lib/store';
import { OnboardingProvider } from '@/lib/onboarding/store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StoreProvider>
        <OnboardingProvider>{children}</OnboardingProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
