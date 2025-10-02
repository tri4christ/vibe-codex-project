import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

/**
 * Root layout for all pages. Providers takes care of client-only context like
 * theme switching while keeping this layout a server component.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
