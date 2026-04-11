import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'E.D.I.T.H 2.0',
  description: 'Autonomous Intelligence System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ 
        background: '#050505', 
        overflow: 'hidden',
        height: '100vh'
      }}>
        {children}
      </body>
    </html>
  )
}
