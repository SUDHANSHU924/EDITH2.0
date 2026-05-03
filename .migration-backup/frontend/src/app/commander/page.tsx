'use client'
import dynamic from 'next/dynamic'
const EDITHApp = dynamic(
  () => import('../../App'),
  { ssr: false }
)
export default function CommanderPage() {
  return <EDITHApp />
}
