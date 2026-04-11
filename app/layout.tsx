import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AURA 2.0 | Advanced Universal Reasoning Architecture',
  description: 'Advanced AI assistant with 12 specialized command modules for development, research, and automation',
  icons: {
    icon: '/icons/edith-logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icons/edith-logo.svg" />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
