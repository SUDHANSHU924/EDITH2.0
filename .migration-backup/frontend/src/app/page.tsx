'use client'
import { useRouter } from 'next/navigation'
export default function Home() {
  const router = useRouter()
  return (
    <div style={{
      background: '#050505',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      <h1 style={{ color: '#00F0FF', fontSize: '48px', 
                   letterSpacing: '0.3em' }}>
        E.D.I.T.H
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', 
                  marginTop: '8px', fontSize: '12px' }}>
        Autonomous Intelligence System v2.0
      </p>
      <button
        onClick={() => router.push('/commander')}
        style={{
          marginTop: '32px',
          border: '1px solid #00F0FF',
          background: 'transparent',
          color: '#00F0FF',
          padding: '12px 32px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          letterSpacing: '0.15em',
          cursor: 'pointer'
        }}
      >
        INITIALIZE SYSTEM
      </button>
    </div>
  )
}
