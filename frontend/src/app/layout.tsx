import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EDITH 2.0",
  description: "E.D.I.T.H - Autonomous Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void text-white grid-bg">
        {children}
      </body>
    </html>
  );
}
